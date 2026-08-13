"use client";

import { useState } from "react";

interface CreateCaseFormProps {
  onSuccess?: (caseData: unknown) => void;
}

export function CreateCaseForm({ onSuccess }: CreateCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caseId: "",
    type: "PRODUCTION INCIDENT",
    severity: "SEV-2",
    title: "",
    subtitle: "",
    confidence: 75,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "confidence" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sources: 0,
          activity: 0,
        }),
      });

      if (response.ok) {
        const caseData = await response.json();
        setFormData({
          caseId: "",
          type: "PRODUCTION INCIDENT",
          severity: "SEV-2",
          title: "",
          subtitle: "",
          confidence: 75,
        });
        onSuccess?.(caseData);
      }
    } catch (error) {
      console.error("Failed to create case:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Create New Case</h2>

      <div>
        <label htmlFor="case-id" className="block text-sm font-semibold text-gray-700 mb-1">Case ID</label>
        <input
          type="text"
          id="case-id"
          name="caseId"
          value={formData.caseId}
          onChange={handleChange}
          placeholder="e.g., CZ-1920"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="case-type" className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
          <select
            name="type"
            id="case-type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option>PRODUCTION INCIDENT</option>
            <option>CERTIFICATE RISK</option>
            <option>DATABASE SATURATION</option>
            <option>CUSTOMER ISSUE</option>
            <option>DATA PIPELINE</option>
          </select>
        </div>

        <div>
          <label htmlFor="case-severity" className="block text-sm font-semibold text-gray-700 mb-1">Severity</label>
          <select
            name="severity"
            id="case-severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option>SEV-1</option>
            <option>SEV-2</option>
            <option>SEV-3</option>
            <option>EXPIRES IN 6 DAYS</option>
            <option>COMPLIANCE</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="case-title" className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
        <input
          type="text"
          id="case-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief incident title"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="case-subtitle" className="block text-sm font-semibold text-gray-700 mb-1">Subtitle (Optional)</label>
        <textarea
          name="subtitle"
          id="case-subtitle"
          value={formData.subtitle}
          onChange={handleChange}
          placeholder="Additional context or description"
          className="w-full px-3 py-2 border border-gray-300 rounded h-24"
        />
      </div>

      <div>
        <label htmlFor="case-confidence" className="block text-sm font-semibold text-gray-700 mb-1">Confidence: {formData.confidence}%</label>
        <input
          type="range"
          id="case-confidence"
          name="confidence"
          min="0"
          max="100"
          value={formData.confidence}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Case"}
      </button>
    </form>
  );
}
