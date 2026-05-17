#!/bin/bash

# Cluster Verification Script
# Usage: ./verify-cluster.sh <CLUSTER_ID> [API_URL]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_ID="${1}"
API_URL="${2:-http://localhost:3000}"
SSH_KEY="${SSH_KEY:-}"
TEMP_DIR="/tmp/k3s-verify-$$"

if [ -z "$CLUSTER_ID" ]; then
    echo -e "${RED}Error: CLUSTER_ID required${NC}"
    echo "Usage: $0 <CLUSTER_ID> [API_URL]"
    echo ""
    echo "Example:"
    echo "  $0 7bf2b2b8-aaf7-4f57-bdc8-cfe9126f38bc"
    echo "  $0 7bf2b2b8-aaf7-4f57-bdc8-cfe9126f38bc http://localhost:3000"
    exit 1
fi

mkdir -p "$TEMP_DIR"

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_error "jq is not installed. Please install it first."
    echo "  Ubuntu/Debian: sudo apt-get install jq"
    echo "  macOS: brew install jq"
    exit 1
fi

# 1. Verify API connectivity
print_header "1. Checking API Connectivity"
if curl -s -f "${API_URL}/infrastructure/clusters" > /dev/null 2>&1; then
    print_success "API is reachable at ${API_URL}"
else
    print_error "Cannot reach API at ${API_URL}"
    exit 1
fi

# 2. Get cluster details
print_header "2. Fetching Cluster Details"
CLUSTER_JSON=$(curl -s "${API_URL}/infrastructure/clusters/${CLUSTER_ID}")

if echo "$CLUSTER_JSON" | jq -e '.id' > /dev/null 2>&1; then
    print_success "Cluster found"

    CLUSTER_NAME=$(echo "$CLUSTER_JSON" | jq -r '.name')
    CLUSTER_STATUS=$(echo "$CLUSTER_JSON" | jq -r '.status')
    NODE_COUNT=$(echo "$CLUSTER_JSON" | jq -r '.nodeCount')
    MASTER_IP=$(echo "$CLUSTER_JSON" | jq -r '.masterIpAddress')
    K3S_VERSION=$(echo "$CLUSTER_JSON" | jq -r '.k3sVersion')
    PROVIDER=$(echo "$CLUSTER_JSON" | jq -r '.provider')

    echo ""
    print_info "Cluster Name: $CLUSTER_NAME"
    print_info "Status: $CLUSTER_STATUS"
    print_info "Node Count: $NODE_COUNT"
    print_info "Master IP: $MASTER_IP"
    print_info "K3s Version: $K3S_VERSION"
    print_info "Provider: $PROVIDER"

    if [ "$CLUSTER_STATUS" = "READY" ]; then
        print_success "Cluster status is READY"
    elif [ "$CLUSTER_STATUS" = "CREATING" ]; then
        print_warning "Cluster is still CREATING"
    elif [ "$CLUSTER_STATUS" = "ERROR" ]; then
        print_error "Cluster status is ERROR"
    else
        print_warning "Cluster status: $CLUSTER_STATUS"
    fi
else
    print_error "Cluster not found or API returned error"
    echo "$CLUSTER_JSON" | jq '.'
    exit 1
fi

# 3. Get cluster nodes
print_header "3. Checking Cluster Nodes"
NODES_JSON=$(curl -s "${API_URL}/infrastructure/clusters/${CLUSTER_ID}/nodes")

if echo "$NODES_JSON" | jq -e '.[0]' > /dev/null 2>&1; then
    ACTUAL_NODE_COUNT=$(echo "$NODES_JSON" | jq '. | length')
    print_success "Found $ACTUAL_NODE_COUNT nodes"

    if [ "$ACTUAL_NODE_COUNT" -eq "$NODE_COUNT" ]; then
        print_success "Node count matches expected ($NODE_COUNT)"
    else
        print_warning "Node count mismatch: expected $NODE_COUNT, found $ACTUAL_NODE_COUNT"
    fi

    echo ""
    print_info "Node Details:"
    echo "$NODES_JSON" | jq -r '.[] | "  - \(.serverName) [\(.nodeType)] - \(.ipAddress) - Status: \(.status)"'

    # Check if all nodes are READY
    NOT_READY=$(echo "$NODES_JSON" | jq '[.[] | select(.status != "READY")] | length')
    if [ "$NOT_READY" -eq 0 ]; then
        print_success "All nodes are READY"
    else
        print_warning "$NOT_READY nodes are not READY"
    fi
else
    print_error "No nodes found or error fetching nodes"
fi

# 4. Try to get kubeconfig
print_header "4. Checking Kubeconfig Availability"
KUBECONFIG_JSON=$(curl -s "${API_URL}/infrastructure/clusters/${CLUSTER_ID}/kubeconfig")

if echo "$KUBECONFIG_JSON" | jq -e '.kubeconfig' > /dev/null 2>&1; then
    print_success "Kubeconfig is available"

    KUBECONFIG_FILE="${TEMP_DIR}/kubeconfig-${CLUSTER_ID}.yaml"
    echo "$KUBECONFIG_JSON" | jq -r '.kubeconfig' > "$KUBECONFIG_FILE"
    print_info "Kubeconfig saved to: $KUBECONFIG_FILE"

    # Test kubectl if available
    if command -v kubectl &> /dev/null; then
        print_header "5. Testing kubectl Connection"

        export KUBECONFIG="$KUBECONFIG_FILE"

        if kubectl cluster-info > /dev/null 2>&1; then
            print_success "kubectl can connect to cluster"

            echo ""
            print_info "Cluster Info:"
            kubectl cluster-info | sed 's/^/  /'

            echo ""
            print_info "Nodes:"
            kubectl get nodes -o wide | sed 's/^/  /'

            echo ""
            print_info "System Pods:"
            kubectl get pods -n kube-system --no-headers | wc -l | xargs echo "  Total:" | sed 's/^/  /'

            RUNNING_PODS=$(kubectl get pods -n kube-system --no-headers | grep -c "Running" || echo "0")
            TOTAL_PODS=$(kubectl get pods -n kube-system --no-headers | wc -l)

            if [ "$RUNNING_PODS" -eq "$TOTAL_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
                print_success "All system pods are Running ($RUNNING_PODS/$TOTAL_PODS)"
            else
                print_warning "Some system pods are not Running ($RUNNING_PODS/$TOTAL_PODS)"
                kubectl get pods -n kube-system | grep -v "Running" | sed 's/^/  /'
            fi

        else
            print_error "kubectl cannot connect to cluster"
            print_info "This might be due to firewall or networking issues"
        fi
    else
        print_warning "kubectl not found, skipping connection test"
        print_info "Install kubectl to test cluster connectivity"
    fi
else
    print_warning "Kubeconfig not available yet"
    print_info "This is normal if the cluster is still being created"
fi

# 6. SSH checks (if SSH key is provided)
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ] && [ "$CLUSTER_STATUS" = "READY" ]; then
    print_header "6. SSH Verification on Master Node"

    SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -q"

    print_info "Attempting SSH to master: $MASTER_IP"

    if ssh $SSH_OPTS -i "$SSH_KEY" root@"$MASTER_IP" 'echo "SSH connection successful"' > /dev/null 2>&1; then
        print_success "SSH connection to master successful"

        # Check K3s service
        if ssh $SSH_OPTS -i "$SSH_KEY" root@"$MASTER_IP" 'systemctl is-active k3s' > /dev/null 2>&1; then
            print_success "K3s service is running on master"
        else
            print_error "K3s service is not running on master"
        fi

        # Check kubectl on master
        NODE_LIST=$(ssh $SSH_OPTS -i "$SSH_KEY" root@"$MASTER_IP" 'kubectl get nodes --no-headers 2>/dev/null | wc -l' || echo "0")
        if [ "$NODE_LIST" -gt 0 ]; then
            print_success "Master can list $NODE_LIST nodes via kubectl"
        else
            print_warning "Master kubectl returned no nodes"
        fi

        # Check marker files
        if ssh $SSH_OPTS -i "$SSH_KEY" root@"$MASTER_IP" 'test -f /var/log/k3s-master-ready' > /dev/null 2>&1; then
            print_success "K3s master initialization marker found"
        else
            print_warning "K3s master initialization marker not found"
        fi

    else
        print_warning "Cannot SSH to master node"
        print_info "Make sure you set SSH_KEY environment variable:"
        print_info "  export SSH_KEY=/path/to/your/ssh/key"
    fi
else
    if [ "$CLUSTER_STATUS" != "READY" ]; then
        print_info "Skipping SSH checks (cluster not ready)"
    else
        print_info "Skipping SSH checks (no SSH_KEY provided)"
        print_info "Set SSH_KEY environment variable to enable SSH checks:"
        print_info "  export SSH_KEY=/path/to/your/ssh/key"
        print_info "  $0 $CLUSTER_ID $API_URL"
    fi
fi

# Summary
print_header "Verification Summary"

ISSUES=0

if [ "$CLUSTER_STATUS" != "READY" ]; then
    print_error "Cluster is not in READY state"
    ISSUES=$((ISSUES + 1))
fi

if [ "$NOT_READY" -gt 0 ]; then
    print_error "Some nodes are not READY"
    ISSUES=$((ISSUES + 1))
fi

if ! echo "$KUBECONFIG_JSON" | jq -e '.kubeconfig' > /dev/null 2>&1; then
    print_warning "Kubeconfig not available"
fi

echo ""
if [ $ISSUES -eq 0 ]; then
    print_success "Cluster verification completed successfully!"
    echo ""
    print_info "Next steps:"
    print_info "  1. Download kubeconfig from: ${API_URL}/infrastructure/clusters/${CLUSTER_ID}/kubeconfig"
    print_info "  2. Export kubeconfig: export KUBECONFIG=${KUBECONFIG_FILE}"
    print_info "  3. Access cluster: kubectl get nodes"
    print_info "  4. SSH to master: ssh root@${MASTER_IP}"
else
    print_warning "Cluster verification completed with $ISSUES issues"
    print_info "Check the details above for more information"
fi

# Cleanup
echo ""
print_info "Temporary files stored in: $TEMP_DIR"
print_info "To clean up: rm -rf $TEMP_DIR"

exit $ISSUES
