apiVersion: v1
kind: Secret
metadata:
  name: {{SECRET_NAME}}
  namespace: {{NAMESPACE}}
  labels:
    managed-by: flui-cloud
type: Opaque
stringData:
  cloud: |
    [default]
    aws_access_key_id={{ACCESS_KEY}}
    aws_secret_access_key={{SECRET_KEY}}
  kopia-repo-password: "{{KOPIA_PASSPHRASE}}"
