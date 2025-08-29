import { StudyTypeOption } from "./types";
import {
  BarChart3,
  TrendingUp,
  Users,
  GitCompare,
  Layers,
  TestTube,
} from "lucide-react";

export const STUDY_TYPES: StudyTypeOption[] = [
  {
    value: "two-proportion-z-test",
    label: "Two-Proportion Z-Test",
    description: "Compare success rates between two independent groups",
    icon: "BarChart3",
    category: "binary",
    dataType: "proportions",
  },
  {
    value: "two-sample-t-test",
    label: "Two-Sample T-Test",
    description: "Compare means between two independent groups",
    icon: "TrendingUp",
    category: "continuous",
    dataType: "means",
  },
  {
    value: "paired-t-test",
    label: "Paired T-Test",
    description: "Compare means for the same subjects (before/after)",
    icon: "GitCompare",
    category: "continuous",
    dataType: "paired",
  },
  {
    value: "anova",
    label: "ANOVA",
    description: "Compare means across three or more groups",
    icon: "Layers",
    category: "continuous",
    dataType: "multiple-groups",
  },
  {
    value: "mcnemar-test",
    label: "McNemar's Test",
    description: "Compare proportions for paired categorical data",
    icon: "Users",
    category: "binary",
    dataType: "paired",
  },
  {
    value: "fisher-exact-test",
    label: "Fisher's Exact Test",
    description: "Small sample size test for categorical data",
    icon: "TestTube",
    category: "binary",
    dataType: "proportions",
  },
];

export const getStudyTypeIcon = (iconName: string) => {
  switch (iconName) {
    case "BarChart3":
      return BarChart3;
    case "TrendingUp":
      return TrendingUp;
    case "Users":
      return Users;
    case "GitCompare":
      return GitCompare;
    case "Layers":
      return Layers;
    case "TestTube":
      return TestTube;
    default:
      return BarChart3;
  }
};

export const getStudyTypeByValue = (value: string) => {
  return STUDY_TYPES.find((type) => type.value === value);
};
