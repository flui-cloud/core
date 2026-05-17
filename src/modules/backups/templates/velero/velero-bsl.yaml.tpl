apiVersion: velero.io/v1
kind: BackupStorageLocation
metadata:
  name: {{BSL_NAME}}
  namespace: {{NAMESPACE}}
  labels:
    managed-by: flui-cloud
    flui-destination-id: "{{DESTINATION_ID}}"
spec:
  provider: aws
  default: {{IS_DEFAULT}}
  objectStorage:
    bucket: {{BUCKET}}
    prefix: {{PREFIX}}
  config:
    region: {{REGION}}
    s3ForcePathStyle: "{{FORCE_PATH_STYLE}}"
    s3Url: {{ENDPOINT}}
  credential:
    name: {{SECRET_NAME}}
    key: cloud
