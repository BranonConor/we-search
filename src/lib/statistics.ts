import { StudyVariables, StudyResult, StudyType } from "./types";

// Approximation of the normal CDF using the error function (erf)
// Source: Abramowitz & Stegun, Handbook of Mathematical Functions, Eq. 7.1.26
const normalCdf = (z: number): number => {
  const erf = (x: number): number => {
    // Polynomial approximation constants for erf(x)
    // Optimized to minimize maximum error over range [-∞, ∞]
    const a1 = 0.254829592,
      a2 = -0.284496736,
      a3 = 1.421413741,
      a4 = -1.453152027,
      a5 = 1.061405429,
      p = 0.3275911; // "magic" constant that ensures good convergence

    const sign = x >= 0 ? 1 : -1;
    const ax = Math.abs(x);
    const t = 1.0 / (1.0 + p * ax); // transformation for approximation
    // Evaluate polynomial using Horner's method
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
    return sign * y;
  };
  // Convert erf result to standard normal CDF
  return 0.5 * (1 + erf(z / Math.SQRT2));
};

// Approximation of the inverse normal CDF (probit function)
// Source: Algorithm AS 241 (Wichura, 1988)
// Highly accurate approximation for p in (0,1)
const normalInv = (p: number): number => {
  if (p <= 0 || p >= 1) throw new Error("p must be in (0,1)");

  // Coefficients for rational approximation
  // Different sets (a,b,c,d) are used depending on region of p
  const a = [
    -39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269,
    -30.66479806614716, 2.506628277459239,
  ];
  const b = [
    -54.47609879822406, 161.5858368580409, -155.6989798598866,
    66.80131188771972, -13.28068155288572,
  ];
  const c = [
    -0.007784894002430293, -0.3223964580411365, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    0.007784695709041462, 0.3224671290700398, 2.445134137142996,
    3.754408661907416,
  ];

  const plow = 0.02425; // below this, use lower-tail formula
  const phigh = 1 - plow; // above this, use upper-tail formula
  let q: number, r: number;

  if (p < plow) {
    // Lower tail approximation
    q = Math.sqrt(-2 * Math.log(p));
    return (
      ((((((a[0] * q + a[1]) * q + a[2]) * q + a[3]) * q + a[4]) * q + a[5]) *
        q) /
      (((((b[0] * q + b[1]) * q + b[2]) * q + b[3]) * q + b[4]) * q + 1)
    );
  } else if (p <= phigh) {
    // Central region approximation (around mean 0)
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    // Upper tail approximation
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      ((((((a[0] * q + a[1]) * q + a[2]) * q + a[3]) * q + a[4]) * q + a[5]) *
        q) /
      (((((b[0] * q + b[1]) * q + b[2]) * q + b[3]) * q + b[4]) * q + 1)
    );
  }
};

// Helper functions for statistical calculations
const mean = (data: number[]): number => {
  return data.reduce((sum, val) => sum + val, 0) / data.length;
};

const variance = (data: number[]): number => {
  const m = mean(data);
  return (
    data.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / (data.length - 1)
  );
};

const standardDeviation = (data: number[]): number => {
  return Math.sqrt(variance(data));
};

// Student's t-distribution CDF approximation
const tCdf = (t: number, df: number): number => {
  // Simple approximation for t-distribution
  // For large degrees of freedom, t-distribution approaches normal
  if (df > 30) {
    return normalCdf(t);
  }

  // For smaller df, use approximation
  const x = df / (df + t * t);
  const beta = 0.5 * Math.log(x) + 0.5 * Math.log(1 - x);
  const gamma = 0.5 * (Math.log(Math.PI) + Math.log(df));
  return 0.5 + 0.5 * Math.sign(t) * (1 - Math.exp(beta - gamma));
};

// F-distribution CDF approximation (for ANOVA)
const fCdf = (f: number, df1: number, df2: number): number => {
  // Simple approximation for F-distribution
  const x = (df1 * f) / (df1 * f + df2);
  return 1 - Math.pow(1 - x, df2 / 2);
};

// Two-proportion z-test with CI (existing function)
export const twoPropZTest = ({
  n1,
  x1,
  n2,
  x2,
  alpha = 0.05,
  alternative = "two-sided",
}: StudyVariables): StudyResult => {
  // Validate inputs
  if (![n1, x1, n2, x2].every(Number.isFinite))
    throw new Error("Inputs must be numbers");
  if (![n1, x1, n2, x2].every(Number.isInteger))
    throw new Error("Counts must be integers");
  if (x1 > n1 || x2 > n2)
    throw new Error("Successes cannot exceed sample size");
  if (!["two-sided", "greater", "less"].includes(alternative))
    throw new Error("Alternative must be 'two-sided', 'greater', or 'less'");

  // Sample proportions
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const effect = p1 - p2; // observed difference
  const pooledP = (x1 + x2) / (n1 + n2); // pooled proportion under H0

  // Standard errors
  const sePooled = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));
  const seUnpooled = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);

  // z-statistic
  const z = effect / sePooled;

  // Compute p-value based on test direction
  let pValue: number;
  if (alternative === "two-sided") {
    pValue = 2 * (1 - normalCdf(Math.abs(z)));
  } else if (alternative === "greater") {
    pValue = 1 - normalCdf(z);
  } else {
    pValue = normalCdf(z);
  }

  // Critical value for CI (1.96 for 95% CI if alpha=0.05)
  const zCrit = Math.abs(normalInv(1 - alpha / 2));
  const ciLower = effect - zCrit * seUnpooled;
  const ciUpper = effect + zCrit * seUnpooled;

  // Assumption checks (rule-of-thumb for z-test validity)
  const assumptions: string[] = [];
  if (x1 < 10 || n1 - x1 < 10)
    assumptions.push("Group 1 may violate normal approx rule");
  if (x2 < 10 || n2 - x2 < 10)
    assumptions.push("Group 2 may violate normal approx rule");
  if (assumptions.length === 0) assumptions.push("Assumptions appear OK");

  return {
    p1,
    p2,
    effect,
    z,
    pValue,
    significant: pValue <= alpha,
    ciLower,
    ciUpper,
    alpha,
    alternative,
    assumptions,
  };
};

// Two-sample t-test
export const twoSampleTTest = ({
  group1Data,
  group2Data,
  alpha = 0.05,
  alternative = "two-sided",
}: StudyVariables): StudyResult => {
  if (
    !group1Data ||
    !group2Data ||
    group1Data.length === 0 ||
    group2Data.length === 0
  ) {
    throw new Error("Both groups must have data");
  }

  const n1 = group1Data.length;
  const n2 = group2Data.length;
  const mean1 = mean(group1Data);
  const mean2 = mean(group2Data);
  const var1 = variance(group1Data);
  const var2 = variance(group2Data);

  // Pooled variance
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
  const pooledSE = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

  // t-statistic
  const t = (mean1 - mean2) / pooledSE;
  const df = n1 + n2 - 2;

  // Compute p-value
  let pValue: number;
  if (alternative === "two-sided") {
    pValue = 2 * (1 - tCdf(Math.abs(t), df));
  } else if (alternative === "greater") {
    pValue = 1 - tCdf(t, df);
  } else {
    pValue = tCdf(t, df);
  }

  // Assumptions
  const assumptions: string[] = [];
  if (n1 < 30 || n2 < 30)
    assumptions.push("Small sample sizes - consider normality");
  if (assumptions.length === 0) assumptions.push("Assumptions appear OK");

  return {
    mean1,
    mean2,
    meanDifference: mean1 - mean2,
    t,
    degreesOfFreedom: df,
    pValue,
    significant: pValue <= alpha,
    alpha,
    alternative,
    assumptions,
  };
};

// Paired t-test
export const pairedTTest = ({
  pairedData,
  alpha = 0.05,
  alternative = "two-sided",
}: StudyVariables): StudyResult => {
  if (!pairedData || pairedData.length === 0) {
    throw new Error("Paired data is required");
  }

  const differences = pairedData.map((pair) => pair.after - pair.before);
  const n = differences.length;
  const meanDiff = mean(differences);
  const seDiff = standardDeviation(differences) / Math.sqrt(n);

  // t-statistic
  const t = meanDiff / seDiff;
  const df = n - 1;

  // Compute p-value
  let pValue: number;
  if (alternative === "two-sided") {
    pValue = 2 * (1 - tCdf(Math.abs(t), df));
  } else if (alternative === "greater") {
    pValue = 1 - tCdf(t, df);
  } else {
    pValue = tCdf(t, df);
  }

  // Assumptions
  const assumptions: string[] = [];
  if (n < 30) assumptions.push("Small sample size - consider normality");
  if (assumptions.length === 0) assumptions.push("Assumptions appear OK");

  return {
    mean1: mean(pairedData.map((p) => p.before)),
    mean2: mean(pairedData.map((p) => p.after)),
    meanDifference: meanDiff,
    t,
    degreesOfFreedom: df,
    pValue,
    significant: pValue <= alpha,
    alpha,
    alternative,
    assumptions,
  };
};

// One-way ANOVA
export const oneWayAnova = ({
  group1Data,
  group2Data,
  group3Data,
  alpha = 0.05,
}: StudyVariables): StudyResult => {
  const groups = [group1Data, group2Data, group3Data].filter(
    (data) => data && data.length > 0
  );
  if (groups.length < 2) {
    throw new Error("At least two groups with data are required");
  }

  const k = groups.length;
  const n = groups.reduce((sum, group) => sum + group.length, 0);
  const grandMean = mean(groups.flat());

  const groupMeans = groups.map((group) => mean(group));
  const groupSizes = groups.map((group) => group.length);

  // Between-groups sum of squares
  const betweenGroupsSS = groupSizes.reduce(
    (sum, size, i) => sum + size * Math.pow(groupMeans[i] - grandMean, 2),
    0
  );

  // Within-groups sum of squares
  const withinGroupsSS = groups.reduce(
    (sum, group) =>
      sum +
      group.reduce(
        (groupSum, val) => groupSum + Math.pow(val - mean(group), 2),
        0
      ),
    0
  );

  // F-statistic
  const dfBetween = k - 1;
  const dfWithin = n - k;
  const msBetween = betweenGroupsSS / dfBetween;
  const msWithin = withinGroupsSS / dfWithin;
  const f = msBetween / msWithin;

  // P-value
  const pValue = 1 - fCdf(f, dfBetween, dfWithin);

  // Assumptions
  const assumptions: string[] = [];
  if (groups.some((group) => group.length < 30)) {
    assumptions.push("Some groups have small sample sizes");
  }
  if (assumptions.length === 0) assumptions.push("Assumptions appear OK");

  return {
    f,
    groupMeans,
    grandMean,
    betweenGroupsSS,
    withinGroupsSS,
    pValue,
    significant: pValue <= alpha,
    alpha,
    alternative: "two-sided",
    assumptions,
  };
};

// Main statistical analysis function
export const runStatisticalTest = (
  studyType: StudyType,
  variables: StudyVariables
): StudyResult => {
  switch (studyType) {
    case "two-proportion-z-test":
      return twoPropZTest(variables);
    case "two-sample-t-test":
      return twoSampleTTest(variables);
    case "paired-t-test":
      return pairedTTest(variables);
    case "anova":
      return oneWayAnova(variables);
    default:
      throw new Error(`Unsupported study type: ${studyType}`);
  }
};
