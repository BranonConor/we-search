"use client";

import { Study } from "@/lib/types";
import {
  formatDate,
  getSignificanceColor,
  getSignificanceText,
} from "@/lib/utils";
import { Eye, Trash2, TrendingUp, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudyTypeByValue } from "@/lib/study-types";

interface StudyCardProps {
  study: Study;
  onView: (study: Study) => void;
  onDelete: (studyId: string) => void;
}

export function StudyCard({ study, onView, onDelete }: StudyCardProps) {
  const hasResults = study.results !== undefined;
  const studyTypeInfo = getStudyTypeByValue(study.studyType);

  const getStudySummary = () => {
    switch (study.studyType) {
      case "two-proportion-z-test":
      case "fisher-exact-test":
        return {
          label: "Sample Sizes",
          value: `n₁=${study.variables.n1}, n₂=${study.variables.n2}`,
          icon: Users,
        };

      case "two-sample-t-test":
        return {
          label: "Data Points",
          value: `${study.variables.group1Data?.length || 0}, ${
            study.variables.group2Data?.length || 0
          }`,
          icon: TrendingUp,
        };

      case "paired-t-test":
        return {
          label: "Pairs",
          value: `${study.variables.pairedData?.length || 0} subjects`,
          icon: TrendingUp,
        };

      case "anova":
        const groupCounts = [
          study.variables.group1Data?.length || 0,
          study.variables.group2Data?.length || 0,
          study.variables.group3Data?.length || 0,
        ].filter((count) => count > 0);
        return {
          label: "Groups",
          value: `${groupCounts.length} groups (${groupCounts.join(", ")})`,
          icon: TrendingUp,
        };

      default:
        return {
          label: "Data",
          value: "Unknown format",
          icon: TrendingUp,
        };
    }
  };

  const summary = getStudySummary();
  const Icon = summary.icon;

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {studyTypeInfo?.label || study.studyType}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
              {study.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {study.description}
            </p>
          </div>
          {hasResults && (
            <div
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                getSignificanceColor(study.results!.significant)
              )}
            >
              {getSignificanceText(study.results!.significant)}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Icon className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {summary.label}: {summary.value}
            </span>
          </div>
        </div>

        {/* Results Preview */}
        {hasResults && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">P-value:</span>
              <span className="font-medium">
                {study.results!.pValue < 0.001
                  ? "< 0.001"
                  : study.results!.pValue.toFixed(3)}
              </span>
            </div>
            {study.results!.t && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">T-statistic:</span>
                <span className="font-medium">
                  {study.results!.t.toFixed(3)}
                </span>
              </div>
            )}
            {study.results!.z && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Z-statistic:</span>
                <span className="font-medium">
                  {study.results!.z.toFixed(3)}
                </span>
              </div>
            )}
            {study.results!.f && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">F-statistic:</span>
                <span className="font-medium">
                  {study.results!.f.toFixed(3)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(study.createdAt)}
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(study)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(study.id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete study"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
