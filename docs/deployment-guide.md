# Deployment & CI/CD Strategy

ClinixPro uses a modern, automated pipeline to ensure safe and reliable deployments across hundreds of clinic environments.

## 1. Environment Separation
- **Development**: Local development and branch-based previews.
- **Staging**: Final integration testing with production-like data (anonymized).
- **Production**: Main SaaS platform serving all clinics.

## 2. CI/CD Pipeline (GitHub Actions)
- **Lint & Test**: Every PR triggers a full suite of linting and unit tests.
- **Preview Builds**: Vercel/Next.js creates unique preview URLs for every feature branch.
- **Deployment**:
    - Merges to `main` trigger an automated deployment to **Staging**.
    - Manual promotion (tagging) to `release/*` triggers deployment to **Production**.

## 3. Infrastructure as Code (IaC)
- Database migrations are managed via **Prisma Migrate** and applied during the CI/CD pipeline before the application code is deployed.
- Env secrets are managed via GitHub Secrets and injected during builds.

## 4. Rollback Strategy
- In case of critical errors, Vercel allows instant rollbacks with 0ms downtime.
- Database rollbacks require manual restoration using PITR (Point-in-Time Recovery).

---
**Last Updated**: 2026-03-07
