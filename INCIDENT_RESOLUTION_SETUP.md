# CaseZero Incident Resolution Platform

A production-ready incident resolution dashboard built with Next.js, Drizzle ORM, and Cloudflare D1. This platform provides end-to-end incident management from detection through verification.

## Features

✅ **Complete Incident Lifecycle**
- Detect → Diagnose → Decide → Act → Verify workflow
- Multi-user support with same permissions (MVP)
- Real-time case status tracking

✅ **Advanced Analysis**
- Confidence-based incident scoring (0-100%)
- Causal chain visualization
- Bounded evidence tracking with audit trails
- Policy compliance evaluation

✅ **Risk Management**
- Blast radius assessment
- Automatic stop conditions
- Approval workflow with decision gates
- Rollback capabilities

✅ **Observability**
- Key metrics and KPI tracking
- Evidence timeline with source correlation
- Activity audit trail
- Comprehensive logging

## Quick Start

### Prerequisites
- Node.js 22.13.0+
- pnpm
- Cloudflare account (for production)

### Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Generate database migrations:**
   ```bash
   pnpm run db:generate
   ```

3. **Start development server:**
   ```bash
   pnpm run dev
   ```

4. **Seed sample data:**
   ```bash
   # Once server is running, POST to:
   curl -X POST http://localhost:3000/api/seed
   ```

5. **Access the dashboard:**
   - Dashboard: http://localhost:3000/dashboard
   - Seed API: http://localhost:3000/api/seed

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── cases/              # Case CRUD
│   │   ├── approvals/          # Approval workflow
│   │   ├── evidence/           # Evidence tracking
│   │   ├── activities/         # Activity logs
│   │   └── seed/               # Database seeding
│   ├── dashboard/              # Dashboard view
│   ├── case/[id]/              # Case detail view
│   └── page.tsx                # Home redirect
├── components/                 # UI components
│   ├── CaseCard.tsx
│   ├── DiagnosisSection.tsx
│   ├── RecommendationSection.tsx
│   ├── EvidenceSection.tsx
│   ├── MetricsCard.tsx
│   ├── PoliciesSection.tsx
│   └── Sidebar.tsx
├── db/
│   ├── schema.ts               # Database schema
│   └── index.ts                # Database initialization
├── scripts/
│   └── setup-db.sh             # Database setup script
└── wrangler.toml               # Cloudflare Workers config
```

## Database Schema

### Core Tables
- **users** - Multi-user support
- **cases** - Incident cases with status tracking
- **diagnoses** - Root cause analysis
- **recommendations** - Proposed actions
- **approvals** - Approval workflow
- **evidence** - Audit trail items
- **activities** - Timeline of events
- **metrics** - KPIs and measurements
- **policies** - Compliance checks
- **checks** - Verification items
- **stopConditions** - Automatic halt conditions

## API Endpoints

### Cases
- `GET /api/cases` - List all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/[id]` - Get case details
- `PATCH /api/cases/[id]` - Update case

### Approvals
- `GET /api/approvals` - List approvals
- `POST /api/approvals` - Create approval request
- `PATCH /api/approvals` - Update approval status

### Evidence
- `GET /api/evidence` - List evidence
- `POST /api/evidence` - Add evidence

### Activities
- `GET /api/activities` - List activities
- `POST /api/activities` - Log activity

### Database
- `POST /api/seed` - Seed sample data
- `GET /api/seed` - Check database status

## Workflow Example

1. **Detect**: System identifies anomaly
   - Create case with initial data
   - Set confidence level
   - Link evidence sources

2. **Diagnose**: Analyze root cause
   - Add diagnosis with causal chain
   - Evaluate policies
   - Calculate blast radius

3. **Decide**: Human review
   - Display recommendations
   - Verify checks
   - Request approval

4. **Act**: Execute remediation
   - Update case status
   - Track metrics changes
   - Log activities

5. **Verify**: Confirm resolution
   - Monitor metrics
   - Execute synthetic checks
   - Update case to resolved

## Configuration

### Environment Variables
```env
# Database binding (Cloudflare D1)
D1_DB=casezero

# Optional: For local testing
NODE_ENV=development
```

### Wrangler Configuration
Update `wrangler.toml` with your Cloudflare settings:
```toml
[[d1_databases]]
binding = "DB"
database_name = "casezero"
database_id = "your-database-id"
```

## Production Deployment

### Cloudflare Workers

1. **Create D1 database:**
   ```bash
   wrangler d1 create casezero
   ```

2. **Update wrangler.toml** with database_id

3. **Run migrations:**
   ```bash
   wrangler d1 execute casezero --file ./drizzle/0000_*.sql
   ```

4. **Deploy:**
   ```bash
   wrangler deploy
   ```

## Sample Data

The seeding endpoint creates 6 sample cases:
- **CZ-1917**: Certificate expiry incident
- **CZ-1842**: Checkout API degradation
- **CZ-1831**: Database saturation
- **CZ-1825**: Customer duplicate charge
- **CZ-1820**: Dormant admin credential audit
- **CZ-1810**: Data pipeline failure

Each case includes:
- Full diagnosis with causal chain
- Risk assessment
- Policy evaluations
- Evidence trail
- Activity timeline

## Enhancements Over Reference

✨ **Additional Features:**
- Complete database persistence
- Multi-user support architecture
- Full CRUD API
- Evidence tracking system
- Activity audit trail
- Policy compliance framework
- Approval workflow with decision gates
- Metrics and KPI dashboard
- Role-based permission structure (extensible)

## Development

### Generate Database Migrations
```bash
pnpm run db:generate
```

### Lint Code
```bash
pnpm run lint
```

### Run Tests
```bash
pnpm run test
```

## Support

For issues or questions:
1. Check the [setup script](scripts/setup-db.sh)
2. Review [API documentation](app/api)
3. Examine [sample cases](app/api/seed/route.ts)

## License

MIT - See LICENSE file
