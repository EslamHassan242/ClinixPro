# Backup & Disaster Recovery (BDR) Strategy

ClinixPro handles sensitive medical and financial data. This policy ensures data integrity and availability.

## 1. Automated Backups
- **Frequency**: Daily full backups of the PostgreSQL database via Supabase.
- **Retention**: 30 days of daily backups.
- **Off-site Storage**: Backups are encrypted and stored in geographically redundant locations.

## 2. Point-in-Time Recovery (PITR)
- PITR is enabled for the production environment, allowing recovery to any specific second within the last 7 days.
- **Scenario**: Accidental data deletion or corruption.
- **Procedure**: Initiate PITR via Supabase Dashboard -> Database -> Backups -> Restore.

## 3. Storage Backups (Medical Docs)
- Medical scans and lab results stored in Supabase Storage are versioned and replicated across multi-region buckets.

## 4. Disaster Recovery Procedure
In the event of a regional outage:
1. Failover to secondary region (latency may increase).
2. DNS record update to point to secondary load balancer.
3. Verify Redis cache synchronization state.

---
**Last Updated**: 2026-03-07
