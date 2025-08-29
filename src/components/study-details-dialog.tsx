"use client";

import { Study } from "@/lib/types";
import { formatDate, formatPValue } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StudyDetailsDialogProps {
  study: Study | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudyDetailsDialog({
  study,
  open,
  onOpenChange,
}: StudyDetailsDialogProps) {
  if (!study) return null;

  const hasResults = study.results !== undefined;

  // Data for charts
  const proportionData = hasResults
    ? [
        { name: "Group 1", value: study.results!.p1, fill: "#3b82f6" },
        { name: "Group 2", value: study.results!.p2, fill: "#ef4444" },
      ]
    : [];

  const sampleData = [
    {
      name: "Group 1",
      successes: study.variables.x1,
      failures: study.variables.n1 - study.variables.x1,
    },
    {
      name: "Group 2",
      successes: study.variables.x2,
      failures: study.variables.n2 - study.variables.x2,
    },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              {study.title}
            </Dialog.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">{study.description}</p>

          <div className="space-y-6">
            {/* Study Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Study Variables
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Group 1 Sample Size (n₁):
                    </span>
                    <span className="font-medium">{study.variables.n1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Group 1 Successes (x₁):
                    </span>
                    <span className="font-medium">{study.variables.x1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Group 2 Sample Size (n₂):
                    </span>
                    <span className="font-medium">{study.variables.n2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Group 2 Successes (x₂):
                    </span>
                    <span className="font-medium">{study.variables.x2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Significance Level (α):
                    </span>
                    <span className="font-medium">{study.variables.alpha}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Direction:</span>
                    <span className="font-medium capitalize">
                      {study.variables.alternative}
                    </span>
                  </div>
                </div>
              </div>

              {hasResults && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Statistical Results
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effect Size:</span>
                      <span className="font-medium">
                        {(study.results!.effect * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Z-statistic:</span>
                      <span className="font-medium">
                        {study.results!.z.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P-value:</span>
                      <span className="font-medium">
                        {formatPValue(study.results!.pValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Significant:</span>
                      <span
                        className={`font-medium flex items-center ${
                          study.results!.significant
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {study.results!.significant ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-1" />
                        )}
                        {study.results!.significant ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">95% CI:</span>
                      <span className="font-medium">
                        [{(study.results!.ciLower * 100).toFixed(2)}%,{" "}
                        {(study.results!.ciUpper * 100).toFixed(2)}%]
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Charts */}
            {hasResults && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Sample Size Comparison
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sampleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="successes"
                          fill="#3b82f6"
                          name="Successes"
                        />
                        <Bar
                          dataKey="failures"
                          fill="#ef4444"
                          name="Failures"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Proportion Comparison
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={proportionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) =>
                            `${(Number(value) * 100).toFixed(1)}%`
                          }
                        />
                        <Bar dataKey="value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Assumptions */}
            {hasResults && study.results!.assumptions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Assumption Checks
                </h3>
                <ul className="space-y-1">
                  {study.results!.assumptions.map((assumption, index) => (
                    <li
                      key={index}
                      className="text-blue-800 text-sm flex items-start"
                    >
                      <span className="mr-2">•</span>
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata */}
            <div className="text-sm text-gray-500 border-t pt-4">
              <div className="flex justify-between">
                <span>Created: {formatDate(study.createdAt)}</span>
                <span>Last updated: {formatDate(study.updatedAt)}</span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
