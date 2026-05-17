apiVersion: v1
kind: Secret
metadata:
  name: {{SECRET_NAME}}
  namespace: {{NAMESPACE}}
  labels:
    managed-by: flui-cloud
    flui-job-id: "{{JOB_ID}}"
type: Opaque
stringData:
  rclone.conf: |
    [src]
    type = s3
    provider = {{SRC_PROVIDER}}
    endpoint = {{SRC_ENDPOINT}}
    region = {{SRC_REGION}}
    access_key_id = {{SRC_ACCESS_KEY}}
    secret_access_key = {{SRC_SECRET_KEY}}
    force_path_style = {{SRC_FORCE_PATH_STYLE}}

    [dst]
    type = s3
    provider = {{DST_PROVIDER}}
    endpoint = {{DST_ENDPOINT}}
    region = {{DST_REGION}}
    access_key_id = {{DST_ACCESS_KEY}}
    secret_access_key = {{DST_SECRET_KEY}}
    force_path_style = {{DST_FORCE_PATH_STYLE}}
---
apiVersion: batch/v1
kind: Job
metadata:
  name: {{JOB_NAME}}
  namespace: {{NAMESPACE}}
  labels:
    managed-by: flui-cloud
    flui-job-id: "{{JOB_ID}}"
spec:
  backoffLimit: 2
  ttlSecondsAfterFinished: 86400
  template:
    metadata:
      labels:
        managed-by: flui-cloud
        flui-job-id: "{{JOB_ID}}"
    spec:
      restartPolicy: Never
      containers:
        - name: rclone
          image: {{RCLONE_IMAGE}}
          command:
            - rclone
            - --config=/etc/rclone/rclone.conf
            - copy
            - --checksum
            - --transfers=8
            - --checkers=16
            - src:{{SRC_BUCKET}}/{{SRC_PREFIX}}
            - dst:{{DST_BUCKET}}/{{DST_PREFIX}}
          volumeMounts:
            - name: config
              mountPath: /etc/rclone
              readOnly: true
          resources:
            requests:
              cpu: 200m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1Gi
      volumes:
        - name: config
          secret:
            secretName: {{SECRET_NAME}}
