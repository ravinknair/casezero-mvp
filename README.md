# CaseZero MVP

CaseZero is a lightweight incident-resolution demo that simulates evidence-driven operational decisions for security, infrastructure, data, and customer-impact workflows. The app models approval gates, verification checks, automatic stop conditions, and rollback behavior across six realistic runtime scenarios.

## What this project includes

- Six case simulations covering certificate expiry, incidents, database saturation, customer refunds, access remediation, and pipeline failures
- Deterministic workflow state transitions: pending → approved → executing → verifying → resolved or rolled back
- UI-driven approval, rejection, and stop-condition testing
- Node.js + React + Vinext application scaffold

## Local development

```bash
nvm use 22
npm install
npm run dev
```

Validate the project with:

```bash
npm run check
```

## Project structure

- `app/` — UI and simulation logic
- `casezero-mvp/` — full project workspace copied for the active app
- `.github/workflows/ci.yml` — GitHub Actions CI checks for lint, tests, and build
- `Makefile` — local automation shortcuts

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
