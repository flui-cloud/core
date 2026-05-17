apiVersion: v1
kind: ServiceAccount
metadata:
  name: velero
  namespace: {{NAMESPACE}}
  labels:
    managed-by: flui-cloud
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: velero
  labels:
    managed-by: flui-cloud
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: velero
    namespace: {{NAMESPACE}}
