apiVersion: velero.io/v1
kind: Restore
metadata:
  name: {{RESTORE_NAME}}
  namespace: {{NAMESPACE}}
  labels:
    managed-by: flui-cloud
    flui-restore-job-id: "{{RESTORE_JOB_ID}}"
spec:
  backupName: {{BACKUP_NAME}}
{{NAMESPACE_MAPPING_BLOCK}}
{{INCLUDED_NAMESPACES_BLOCK}}
{{LABEL_SELECTOR_BLOCK}}
  restorePVs: true
