apiVersion: velero.io/v1
kind: VolumeSnapshotLocation
metadata:
  name: {{VSL_NAME}}
  namespace: {{NAMESPACE}}
  labels:
    managed-by: flui-cloud
spec:
  provider: aws
  config:
    region: {{REGION}}
