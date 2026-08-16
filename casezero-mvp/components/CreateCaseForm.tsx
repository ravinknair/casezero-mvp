"use client";

import { useState } from "react";
import { externalSupportProviders } from "@/lib/externalSupport";

interface CreateCaseFormProps {
  onSuccess?: (caseData: unknown) => void;
}

export function CreateCaseForm({ onSuccess }: CreateCaseFormProps) {
  const environmentOptions = [
    { value: "production", label: "Production" },
    { value: "pre-production", label: "Pre-Production" },
    { value: "staging", label: "Staging" },
    { value: "uat", label: "UAT" },
    { value: "test", label: "Test" },
    { value: "development", label: "Development" },
    { value: "sandbox", label: "Sandbox" },
    { value: "custom", label: "Custom (enter manually)" },
  ] as const;

  const severityOptions = [
    { value: "SEV-0", label: "SEV-0 — All production systems down" },
    { value: "SEV-1", label: "SEV-1 — Critical outage with broad customer impact" },
    { value: "SEV-2", label: "SEV-2 — Major degradation, key functionality impaired" },
    { value: "SEV-3", label: "SEV-3 — Moderate impact, workaround available" },
    { value: "SEV-4", label: "SEV-4 — Minor issue, limited operational impact" },
    { value: "SEV-5", label: "SEV-5 — Informational/non-urgent support case" },
  ] as const;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caseId: "",
    type: "PRODUCTION INCIDENT",
    severity: "SEV-2",
    externalProvider: "Azure",
    title: "",
    subtitle: "",
    clientEnvironment: "production",
    customClientEnvironment: "",
    zippedLogsPlaceholder: "",
    chatEvidencePlaceholder: "",
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
      const resolvedClientEnvironment =
        formData.clientEnvironment === "custom"
          ? formData.customClientEnvironment.trim()
          : formData.clientEnvironment;

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientEnvironment: resolvedClientEnvironment,
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
          externalProvider: "Azure",
          title: "",
          subtitle: "",
          clientEnvironment: "production",
          customClientEnvironment: "",
          zippedLogsPlaceholder: "",
          chatEvidencePlaceholder: "",
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
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-600">
            {severityOptions.find((item) => item.value === formData.severity)?.label}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="case-provider" className="block text-sm font-semibold text-gray-700 mb-1">
          External Cloud Provider Route
        </label>
        <select
          name="externalProvider"
          id="case-provider"
          value={formData.externalProvider}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          {externalSupportProviders.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-600">
          New case will be labeled and tracked for direct escalation with this provider.
        </p>
      </div>

      <div className="rounded border border-gray-200 bg-gray-50 p-3">
        <div className="text-sm font-semibold text-gray-800 mb-2">Severity definitions</div>
        <ul className="text-xs text-gray-700 space-y-1">
          {severityOptions.map((option) => (
            <li key={`severity-definition-${option.value}`}>{option.label}</li>
          ))}
        </ul>
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
        <label htmlFor="case-client-environment" className="block text-sm font-semibold text-gray-700 mb-1">
          Client Environment
        </label>
        <select
          id="case-client-environment"
          name="clientEnvironment"
          value={formData.clientEnvironment}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          {environmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {formData.clientEnvironment === "custom" && (
        <div>
          <label htmlFor="case-custom-client-environment" className="block text-sm font-semibold text-gray-700 mb-1">
            Custom Client Environment
          </label>
          <input
            type="text"
            id="case-custom-client-environment"
            name="customClientEnvironment"
            value={formData.customClientEnvironment}
            onChange={handleChange}
            placeholder="e.g., acme-preprod-us-east-2"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="case-zipped-logs" className="block text-sm font-semibold text-gray-700 mb-1">
          Zipped Logs Placeholder
        </label>
        <input
          type="text"
          id="case-zipped-logs"
          name="zippedLogsPlaceholder"
          value={formData.zippedLogsPlaceholder}
          onChange={handleChange}
          placeholder="e.g., pending://acme-prod-incident-logs.zip"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label htmlFor="case-chat-evidence" className="block text-sm font-semibold text-gray-700 mb-1">
          Chat Evidence Placeholder
        </label>
        <textarea
          name="chatEvidencePlaceholder"
          id="case-chat-evidence"
          value={formData.chatEvidencePlaceholder}
          onChange={handleChange}
          placeholder="e.g., Teams channel URL, Slack thread link, Webex export reference"
          className="w-full px-3 py-2 border border-gray-300 rounded h-20"
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
