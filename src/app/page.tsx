"use client";

import { useState, useEffect } from "react";
import { Study, CreateStudyFormData } from "@/lib/types";
import { runStatisticalTest } from "@/lib/statistics";
import { generateId } from "@/lib/utils";
import { StudyCard } from "@/components/study-card";
import { StudyDetailsDialog } from "@/components/study-details-dialog";
import { CreateStudyForm } from "@/components/create-study-form";
import { Plus, BarChart3, TrendingUp, Zap } from "lucide-react";

export default function Dashboard() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load studies from localStorage on mount
  useEffect(() => {
    const savedStudies = localStorage.getItem("research-studies");
    if (savedStudies) {
      const parsedStudies = JSON.parse(savedStudies).map((study: Study) => ({
        ...study,
        createdAt: new Date(study.createdAt),
        updatedAt: new Date(study.updatedAt),
      }));
      setStudies(parsedStudies);
    }
  }, []);

  // Save studies to localStorage whenever studies change
  useEffect(() => {
    localStorage.setItem("research-studies", JSON.stringify(studies));
  }, [studies]);

  const parseDataString = (dataString: string): number[] => {
    return dataString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n));
  };

  const parsePairedData = (
    pairedDataString: string
  ): Array<{ before: number; after: number }> => {
    return pairedDataString
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [before, after] = line
          .split(",")
          .map((s) => parseFloat(s.trim()));
        return { before, after };
      })
      .filter((pair) => !isNaN(pair.before) && !isNaN(pair.after));
  };

  const handleCreateStudy = (formData: CreateStudyFormData) => {
    try {
      // Prepare variables based on study type
      const variables: any = {
        alpha: formData.alpha,
        alternative: formData.alternative,
      };

      // Add data based on study type
      switch (formData.studyType) {
        case "two-proportion-z-test":
        case "fisher-exact-test":
          variables.n1 = formData.n1;
          variables.x1 = formData.x1;
          variables.n2 = formData.n2;
          variables.x2 = formData.x2;
          break;

        case "two-sample-t-test":
          variables.group1Data = parseDataString(formData.group1Data || "");
          variables.group2Data = parseDataString(formData.group2Data || "");
          break;

        case "paired-t-test":
          variables.pairedData = parsePairedData(formData.pairedData || "");
          break;

        case "anova":
          variables.group1Data = parseDataString(formData.group1Data || "");
          variables.group2Data = parseDataString(formData.group2Data || "");
          variables.group3Data = parseDataString(formData.group3Data || "");
          break;
      }

      // Run statistical analysis
      const results = runStatisticalTest(formData.studyType, variables);

      const newStudy: Study = {
        id: generateId(),
        title: formData.title,
        description: formData.description,
        studyType: formData.studyType,
        createdAt: new Date(),
        updatedAt: new Date(),
        variables,
        results,
      };

      setStudies((prev) => [newStudy, ...prev]);
    } catch (error) {
      console.error("Error creating study:", error);
      alert("Error creating study. Please check your inputs.");
    }
  };

  const handleViewStudy = (study: Study) => {
    setSelectedStudy(study);
    setIsDetailsOpen(true);
  };

  const handleDeleteStudy = (studyId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this study? This action cannot be undone."
      )
    ) {
      setStudies((prev) => prev.filter((study) => study.id !== studyId));
    }
  };

  const significantStudies = studies.filter(
    (study) => study.results?.significant
  );
  const totalStudies = studies.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Research Studies
              </h1>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Study</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Studies
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStudies}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Significant Results
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {significantStudies.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStudies > 0
                    ? Math.round(
                        (significantStudies.length / totalStudies) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Studies Grid */}
        {studies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No studies yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first research study to start analyzing data and
              discovering insights.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Study</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study) => (
              <StudyCard
                key={study.id}
                study={study}
                onView={handleViewStudy}
                onDelete={handleDeleteStudy}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <StudyDetailsDialog
        study={selectedStudy}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <CreateStudyForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateStudy}
      />
    </div>
  );
}
