"use client";

import { StudyType, StudyTypeOption } from "@/lib/types";
import { STUDY_TYPES, getStudyTypeIcon } from "@/lib/study-types";
import { Check } from "lucide-react";

interface StudyTypeSelectorProps {
  selectedType: StudyType;
  onSelectType: (type: StudyType) => void;
}

export function StudyTypeSelector({
  selectedType,
  onSelectType,
}: StudyTypeSelectorProps) {
  const categories = [
    {
      name: "Binary Data",
      description: "Yes/No, Success/Failure outcomes",
      types: STUDY_TYPES.filter((type) => type.category === "binary"),
    },
    {
      name: "Continuous Data",
      description: "Scores, Times, Ratings, Amounts",
      types: STUDY_TYPES.filter((type) => type.category === "continuous"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Study Type
        </h3>
        <p className="text-gray-600">
          Select the statistical test that matches your research question and
          data type.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.name} className="space-y-3">
          <div>
            <h4 className="text-md font-medium text-gray-900">
              {category.name}
            </h4>
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.types.map((type) => {
              const Icon = getStudyTypeIcon(type.icon);
              const isSelected = selectedType === type.value;

              return (
                <button
                  key={type.value}
                  onClick={() => onSelectType(type.value)}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5
                        className={`font-medium text-sm ${
                          isSelected ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {type.label}
                      </h5>
                      <p
                        className={`text-xs mt-1 ${
                          isSelected ? "text-blue-700" : "text-gray-600"
                        }`}
                      >
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
