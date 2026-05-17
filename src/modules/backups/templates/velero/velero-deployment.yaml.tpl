apiVersion: apps/v1
kind: Deployment
metadata:
  name: velero
  namespace: {{NAMESPACE}}
  labels:
    managed-by: flui-cloud
    component: velero
spec:
  replicas: 1
  selector:
    matchLabels:
      component: velero
  template:
    metadata:
      labels:
        component: velero
        managed-by: flui-cloud
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8085"
    spec:
      restartPolicy: Always
      serviceAccountName: velero
      containers:
        - name: velero
          image: {{VELERO_IMAGE}}
          imagePullPolicy: IfNotPresent
          ports:
            - name: metrics
              containerPort: 8085
          command:
            - /velero
          args:
            - server
            - --uploader-type=kopia
            - --features=
          volumeMounts:
            - name: plugins
              mountPath: /plugins
            - name: scratch
              mountPath: /scratch
            - name: cloud-credentials
              mountPath: /credentials
          env:
            - name: VELERO_SCRATCH_DIR
              value: /scratch
            - name: VELERO_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: AWS_SHARED_CREDENTIALS_FILE
              value: /credentials/cloud
            - name: VELERO_KOPIA_REPO_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: {{SECRET_NAME}}
                  key: kopia-repo-password
          resources:
            requests:
              cpu: 200m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1Gi
      initContainers:
        - name: velero-plugin-for-aws
          image: {{AWS_PLUGIN_IMAGE}}
          imagePullPolicy: IfNotPresent
          volumeMounts:
            - mountPath: /target
              name: plugins
      volumes:
        - name: plugins
          emptyDir: {}
        - name: scratch
          emptyDir: {}
        - name: cloud-credentials
          secret:
            secretName: {{SECRET_NAME}}
