![CaseZero MVP banner](./casezero-banner.svg)

# CaseZero MVP

CaseZero is a workflow simulator for AI-assisted incident response and operational decision-making. It turns evidence into safe actions by combining structured diagnostics, human approval gates, verification checks, and automatic rollback logic.

## Portfolio-ready summary

This project showcases a product-style interface paired with a deterministic safety engine. It models realistic operational cases such as certificate expiry, production incidents, database saturation, customer refunds, access remediation, and pipeline reliability failures.

## How it works

Each case follows the same decision loop:

1. Intake evidence
   - The app loads the diagnosis, recommended action, risk severity, and relevant evidence.
2. Review the proposed change
   - The user evaluates the bounded scope and stop conditions before approving.
3. Execute the action
   - The workflow moves into execution as the remediation begins.
4. Verify the outcome
   - Safety checks ensure the action remains within acceptable risk limits.
5. Resolve or rollback
   - If the verification passes, the case resolves cleanly. If a stop condition is triggered, the system rolls back instead of leaving partial impact behind.

This creates a compact, high-signal demo of trustable automation in operations.

## Demo flow

![CaseZero workflow diagram](./docs/demo-flow.svg)

## Why this project stands out

- Human-in-the-loop decision design
- Evidence-driven operational reasoning
- Safe bounded actions with rollback protection
- Clean UI for a portfolio-ready technical story

## Local development

```bash
nvm use 22
npm install
npm run dev
```

Validate with:

```bash
npm run check
```

## Project structure

- `app/` — UI and simulation logic
- `.github/workflows/ci.yml` — CI for lint, test, and build
- `Makefile` — local project commands
- `start.sh`, `stop.sh`, `restart.sh` — clean restart flow

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
