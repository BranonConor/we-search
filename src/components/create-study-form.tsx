"use client";

import { useState } from "react";
import { CreateStudyFormData, StudyType } from "@/lib/types";
import { Plus, X, AlertCircle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StudyTypeSelector } from "@/components/study-type-selector";

interface CreateStudyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStudyFormData) => void;
}

export function CreateStudyForm({
  open,
  onOpenChange,
  onSubmit,
}: CreateStudyFormProps) {
  const [formData, setFormData] = useState<CreateStudyFormData>({
    title: "",
    description: "",
    studyType: "two-proportion-z-test",
    n1: 0,
    x1: 0,
    n2: 0,
    x2: 0,
    alpha: 0.05,
    alternative: "two-sided",
    group1Data: "",
    group2Data: "",
    group3Data: "",
    pairedData: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Validate based on study type
    switch (formData.studyType) {
      case "two-proportion-z-test":
      case "fisher-exact-test":
        if (!formData.n1 || formData.n1 <= 0) {
          newErrors.n1 = "Sample size must be greater than 0";
        }
        if (
          (formData.x1 || 0) < 0 ||
          (formData.n1 && (formData.x1 || 0) > formData.n1)
        ) {
          newErrors.x1 = "Successes must be between 0 and sample size";
        }
        if (!formData.n2 || formData.n2 <= 0) {
          newErrors.n2 = "Sample size must be greater than 0";
        }
        if (
          (formData.x2 || 0) < 0 ||
          (formData.n2 && (formData.x2 || 0) > formData.n2)
        ) {
          newErrors.x2 = "Successes must be between 0 and sample size";
        }
        break;

      case "two-sample-t-test":
      case "anova":
        if (!formData.group1Data?.trim()) {
          newErrors.group1Data = "Group 1 data is required";
        }
        if (!formData.group2Data?.trim()) {
          newErrors.group2Data = "Group 2 data is required";
        }
        if (formData.studyType === "anova" && !formData.group3Data?.trim()) {
          newErrors.group3Data = "Group 3 data is required for ANOVA";
        }
        break;

      case "paired-t-test":
        if (!formData.pairedData?.trim()) {
          newErrors.pairedData = "Paired data is required";
        }
        break;
    }

    if (formData.alpha <= 0 || formData.alpha >= 1) {
      newErrors.alpha = "Alpha must be between 0 and 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        title: "",
        description: "",
        studyType: "two-proportion-z-test",
        n1: 0,
        x1: 0,
        n2: 0,
        x2: 0,
        alpha: 0.05,
        alternative: "two-sided",
        group1Data: "",
        group2Data: "",
        group3Data: "",
        pairedData: "",
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateStudyFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderFormFields = () => {
    switch (formData.studyType) {
      case "two-proportion-z-test":
      case "fisher-exact-test":
        return (
          <>
            {/* Group 1 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Group 1 (Treatment/Experimental)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="n1"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Sample Size (n₁) *
                  </Label>
                  <Input
                    id="n1"
                    type="number"
                    min="1"
                    value={formData.n1 || ""}
                    onChange={(e) =>
                      handleInputChange("n1", parseInt(e.target.value) || 0)
                    }
                    className={errors.n1 ? "border-red-300" : ""}
                    placeholder="e.g., 100"
                  />
                  {errors.n1 && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.n1}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="x1"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Successes (x₁) *
                  </Label>
                  <Input
                    id="x1"
                    type="number"
                    min="0"
                    max={formData.n1}
                    value={formData.x1 || ""}
                    onChange={(e) =>
                      handleInputChange("x1", parseInt(e.target.value) || 0)
                    }
                    className={errors.x1 ? "border-red-300" : ""}
                    placeholder="e.g., 45"
                  />
                  {errors.x1 && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.x1}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Group 2 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Group 2 (Control/Comparison)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="n2"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Sample Size (n₂) *
                  </Label>
                  <Input
                    id="n2"
                    type="number"
                    min="1"
                    value={formData.n2 || ""}
                    onChange={(e) =>
                      handleInputChange("n2", parseInt(e.target.value) || 0)
                    }
                    className={errors.n2 ? "border-red-300" : ""}
                    placeholder="e.g., 100"
                  />
                  {errors.n2 && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.n2}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="x2"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Successes (x₂) *
                  </Label>
                  <Input
                    id="x2"
                    type="number"
                    min="0"
                    max={formData.n2}
                    value={formData.x2 || ""}
                    onChange={(e) =>
                      handleInputChange("x2", parseInt(e.target.value) || 0)
                    }
                    className={errors.x2 ? "border-red-300" : ""}
                    placeholder="e.g., 35"
                  />
                  {errors.x2 && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.x2}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case "two-sample-t-test":
      case "anova":
        return (
          <>
            {/* Group 1 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Group 1 Data *
              </h3>
              <div>
                <Label
                  htmlFor="group1Data"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter values separated by commas
                </Label>
                <Textarea
                  id="group1Data"
                  value={formData.group1Data}
                  onChange={(e) =>
                    handleInputChange("group1Data", e.target.value)
                  }
                  rows={3}
                  className={errors.group1Data ? "border-red-300" : ""}
                  placeholder="e.g., 85, 92, 78, 90, 88, 95, 82, 87, 91, 89"
                />
                {errors.group1Data && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.group1Data}
                  </p>
                )}
              </div>
            </div>

            {/* Group 2 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Group 2 Data *
              </h3>
              <div>
                <Label
                  htmlFor="group2Data"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter values separated by commas
                </Label>
                <Textarea
                  id="group2Data"
                  value={formData.group2Data}
                  onChange={(e) =>
                    handleInputChange("group2Data", e.target.value)
                  }
                  rows={3}
                  className={errors.group2Data ? "border-red-300" : ""}
                  placeholder="e.g., 75, 80, 72, 78, 76, 82, 70, 74, 79, 77"
                />
                {errors.group2Data && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.group2Data}
                  </p>
                )}
              </div>
            </div>

            {/* Group 3 for ANOVA */}
            {formData.studyType === "anova" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Group 3 Data *
                </h3>
                <div>
                  <Label
                    htmlFor="group3Data"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter values separated by commas
                  </Label>
                  <Textarea
                    id="group3Data"
                    value={formData.group3Data}
                    onChange={(e) =>
                      handleInputChange("group3Data", e.target.value)
                    }
                    rows={3}
                    className={errors.group3Data ? "border-red-300" : ""}
                    placeholder="e.g., 65, 70, 62, 68, 66, 72, 60, 64, 69, 67"
                  />
                  {errors.group3Data && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.group3Data}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        );

      case "paired-t-test":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Paired Data (Before/After) *
            </h3>
            <div>
              <Label
                htmlFor="pairedData"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter before,after pairs (one per line)
              </Label>
              <Textarea
                id="pairedData"
                value={formData.pairedData}
                onChange={(e) =>
                  handleInputChange("pairedData", e.target.value)
                }
                rows={6}
                className={errors.pairedData ? "border-red-300" : ""}
                placeholder={`e.g., 
80,85
75,82
90,92
70,78
85,88`}
              />
              {errors.pairedData && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.pairedData}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              Create New Study
            </Dialog.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Design your research study by selecting a statistical test and
            defining your data.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Study Type Selection */}
            <StudyTypeSelector
              selectedType={formData.studyType}
              onSelectType={(type) => handleInputChange("studyType", type)}
            />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Study Information
              </h3>

              <div>
                <Label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Study Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-red-300" : ""}
                  placeholder="e.g., Coffee vs Tea Productivity Study"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className={errors.description ? "border-red-300" : ""}
                  placeholder="Describe your research question and methodology..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Dynamic Form Fields */}
            {renderFormFields()}

            {/* Test Parameters */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Test Parameters
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="alpha"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Significance Level (α)
                  </Label>
                  <Input
                    id="alpha"
                    type="number"
                    min="0.001"
                    max="0.999"
                    step="0.001"
                    value={formData.alpha}
                    onChange={(e) =>
                      handleInputChange(
                        "alpha",
                        parseFloat(e.target.value) || 0.05
                      )
                    }
                    className={errors.alpha ? "border-red-300" : ""}
                  />
                  {errors.alpha && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.alpha}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="alternative"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Test Direction
                  </Label>
                  <Select
                    value={formData.alternative}
                    onValueChange={(value) =>
                      handleInputChange(
                        "alternative",
                        value as "two-sided" | "greater" | "less"
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="two-sided">Two-sided</SelectItem>
                      <SelectItem value="greater">
                        One-sided (greater)
                      </SelectItem>
                      <SelectItem value="less">One-sided (less)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Study
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
