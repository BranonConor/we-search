export type StudyType =
  | "two-proportion-z-test" // Binary data, two independent groups
  | "mcnemar-test" // Binary data, paired data
  | "two-sample-t-test" // Continuous data, two independent groups
  | "paired-t-test" // Continuous data, paired data
  | "anova" // Continuous data, more than two groups
  | "fisher-exact-test"; // Small sample sizes

export interface Study {
  id: string;
  title: string;
  description: string;
  studyType: StudyType;
  createdAt: Date;
  updatedAt: Date;
  variables: StudyVariables;
  results?: StudyResult;
}

export interface StudyVariables {
  // Common fields
  alpha: number; // Significance level (default 0.05)
  alternative: "two-sided" | "greater" | "less";

  // For proportion tests (z-test, mcnemar)
  n1?: number; // Sample size for group 1
  x1?: number; // Successes in group 1
  n2?: number; // Sample size for group 2
  x2?: number; // Successes in group 2

  // For t-tests and ANOVA (continuous data)
  group1Data?: number[]; // Raw data for group 1
  group2Data?: number[]; // Raw data for group 2
  group3Data?: number[]; // Raw data for group 3 (ANOVA)

  // For paired tests
  pairedData?: Array<{ before: number; after: number }>;
}

export interface StudyResult {
  // Common results
  pValue: number;
  significant: boolean;
  alpha: number;
  alternative: string;
  assumptions: string[];

  // For proportion tests
  p1?: number;
  p2?: number;
  effect?: number;
  z?: number;
  ciLower?: number;
  ciUpper?: number;

  // For t-tests
  mean1?: number;
  mean2?: number;
  meanDifference?: number;
  t?: number;
  degreesOfFreedom?: number;

  // For ANOVA
  f?: number;
  groupMeans?: number[];
  grandMean?: number;
  betweenGroupsSS?: number;
  withinGroupsSS?: number;

  // For McNemar
  discordantPairs?: number;
  concordantPairs?: number;

  // For Fisher's Exact
  oddsRatio?: number;
}

export interface StudyCardProps {
  study: Study;
  onView: (study: Study) => void;
  onDelete: (studyId: string) => void;
}

export interface CreateStudyFormData {
  title: string;
  description: string;
  studyType: StudyType;
  alpha: number;
  alternative: "two-sided" | "greater" | "less";

  // For proportion tests
  n1?: number;
  x1?: number;
  n2?: number;
  x2?: number;

  // For continuous data tests
  group1Data?: string; // Comma-separated values
  group2Data?: string;
  group3Data?: string;

  // For paired tests
  pairedData?: string; // "before,after" pairs, one per line
}

export interface StudyTypeOption {
  value: StudyType;
  label: string;
  description: string;
  icon: string;
  category: "binary" | "continuous";
  dataType: "proportions" | "means" | "paired" | "multiple-groups";
}
