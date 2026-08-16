export const clientEnvironmentOptions = [
  { value: "production", label: "Production" },
  { value: "pre-production", label: "Pre-Production" },
  { value: "staging", label: "Staging" },
  { value: "uat", label: "UAT" },
  { value: "test", label: "Test" },
  { value: "development", label: "Development" },
  { value: "sandbox", label: "Sandbox" },
  { value: "custom", label: "Custom (enter manually)" },
] as const;

export type ClientEnvironmentOptionValue = (typeof clientEnvironmentOptions)[number]["value"];
