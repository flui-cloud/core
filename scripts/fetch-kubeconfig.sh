#!/bin/bash

# Fetch Kubeconfig from K3s Master
# Usage: ./fetch-kubeconfig.sh <MASTER_IP> [SSH_KEY] [OUTPUT_FILE]

set -e

MASTER_IP="${1}"
SSH_KEY="${2:-$HOME/.ssh/id_rsa}"
OUTPUT_FILE="${3:-kubeconfig.yaml}"

if [ -z "$MASTER_IP" ]; then
    echo "Error: MASTER_IP required"
    echo "Usage: $0 <MASTER_IP> [SSH_KEY] [OUTPUT_FILE]"
    echo ""
    echo "Examples:"
    echo "  $0 159.69.241.228"
    echo "  $0 159.69.241.228 ~/.ssh/my-key"
    echo "  $0 159.69.241.228 ~/.ssh/my-key my-kubeconfig.yaml"
    exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
    echo "Error: SSH key not found at $SSH_KEY"
    echo "Please specify a valid SSH key path"
    exit 1
fi

echo "Fetching kubeconfig from master: $MASTER_IP"
echo "Using SSH key: $SSH_KEY"

# SSH options to avoid interactive prompts
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -q"

# Fetch the kubeconfig from the master
echo "Downloading kubeconfig from master..."
if ! ssh $SSH_OPTS -i "$SSH_KEY" root@"$MASTER_IP" 'sudo cat /etc/rancher/k3s/k3s.yaml' > /tmp/kubeconfig-raw.yaml 2>/dev/null; then
    echo "Error: Failed to fetch kubeconfig from master"
    echo "Please check:"
    echo "  1. Master IP is correct: $MASTER_IP"
    echo "  2. SSH key has access: $SSH_KEY"
    echo "  3. K3s is installed on the master"
    exit 1
fi

echo "Kubeconfig downloaded successfully"

# Replace 127.0.0.1 with the actual master IP
echo "Updating server URL to use master IP..."
sed "s/127\.0\.0\.1/$MASTER_IP/g" /tmp/kubeconfig-raw.yaml > "$OUTPUT_FILE"

# Clean up temp file
rm -f /tmp/kubeconfig-raw.yaml

echo "✓ Kubeconfig saved to: $OUTPUT_FILE"
echo ""
echo "To use this kubeconfig:"
echo "  export KUBECONFIG=$OUTPUT_FILE"
echo "  kubectl get nodes"
echo ""

# Test if kubectl is available
if command -v kubectl &> /dev/null; then
    echo "Testing connection..."
    export KUBECONFIG="$OUTPUT_FILE"

    if kubectl cluster-info > /dev/null 2>&1; then
        echo "✓ Connection successful!"
        echo ""
        kubectl get nodes
    else
        echo "⚠ Connection failed"
        echo "This might be due to:"
        echo "  1. Port 6443 not open on the master firewall"
        echo "  2. K3s not fully initialized yet"
        echo ""
        echo "Try testing from the master first:"
        echo "  ssh -i $SSH_KEY root@$MASTER_IP 'kubectl get nodes'"
    fi
else
    echo "kubectl not found - skipping connection test"
    echo "Install kubectl to test the connection"
fi
