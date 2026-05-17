// Reconciliation is triggered explicitly via:
// 1. POST /applications/:id/reconcile  (on-demand from dashboard)
// 2. After deploy/rollback completes   (called from ApplicationDeployProcessor)
//
// No periodic polling — the dashboard is responsible for requesting status updates.

export const RECONCILIATION_QUEUE = 'application-reconciliation';
