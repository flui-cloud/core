# Cluster Verification Script for PowerShell
# Usage: .\verify-cluster.ps1 -ClusterId <CLUSTER_ID> [-ApiUrl <URL>]

param(
    [Parameter(Mandatory=$true)]
    [string]$ClusterId,

    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "http://localhost:3000",

    [Parameter(Mandatory=$false)]
    [string]$SshKey = $env:SSH_KEY
)

# Colors for output
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
}

$ErrorCount = 0

# 1. Verify API connectivity
Write-Header "1. Checking API Connectivity"
try {
    $null = Invoke-RestMethod -Uri "$ApiUrl/infrastructure/clusters" -Method Get -ErrorAction Stop
    Write-Success "API is reachable at $ApiUrl"
} catch {
    Write-Failure "Cannot reach API at $ApiUrl"
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 2. Get cluster details
Write-Header "2. Fetching Cluster Details"
try {
    $Cluster = Invoke-RestMethod -Uri "$ApiUrl/infrastructure/clusters/$ClusterId" -Method Get -ErrorAction Stop
    Write-Success "Cluster found"

    Write-Host ""
    Write-Info "Cluster Name: $($Cluster.name)"
    Write-Info "Status: $($Cluster.status)"
    Write-Info "Node Count: $($Cluster.nodeCount)"
    Write-Info "Master IP: $($Cluster.masterIpAddress)"
    Write-Info "K3s Version: $($Cluster.k3sVersion)"
    Write-Info "Provider: $($Cluster.provider)"

    switch ($Cluster.status) {
        "READY" { Write-Success "Cluster status is READY" }
        "CREATING" { Write-Warning "Cluster is still CREATING" }
        "ERROR" { Write-Failure "Cluster status is ERROR"; $ErrorCount++ }
        default { Write-Warning "Cluster status: $($Cluster.status)" }
    }
} catch {
    Write-Failure "Cluster not found or API returned error"
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 3. Get cluster nodes
Write-Header "3. Checking Cluster Nodes"
try {
    $Nodes = Invoke-RestMethod -Uri "$ApiUrl/infrastructure/clusters/$ClusterId/nodes" -Method Get -ErrorAction Stop
    $ActualNodeCount = $Nodes.Count
    Write-Success "Found $ActualNodeCount nodes"

    if ($ActualNodeCount -eq $Cluster.nodeCount) {
        Write-Success "Node count matches expected ($($Cluster.nodeCount))"
    } else {
        Write-Warning "Node count mismatch: expected $($Cluster.nodeCount), found $ActualNodeCount"
    }

    Write-Host ""
    Write-Info "Node Details:"
    foreach ($Node in $Nodes) {
        Write-Host "  - $($Node.serverName) [$($Node.nodeType)] - $($Node.ipAddress) - Status: $($Node.status)"
    }

    $NotReady = ($Nodes | Where-Object { $_.status -ne "READY" }).Count
    if ($NotReady -eq 0) {
        Write-Success "All nodes are READY"
    } else {
        Write-Warning "$NotReady nodes are not READY"
        $ErrorCount++
    }
} catch {
    Write-Failure "Error fetching nodes"
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 4. Try to get kubeconfig
Write-Header "4. Checking Kubeconfig Availability"
try {
    $KubeconfigResponse = Invoke-RestMethod -Uri "$ApiUrl/infrastructure/clusters/$ClusterId/kubeconfig" -Method Get -ErrorAction Stop
    Write-Success "Kubeconfig is available"

    $TempDir = "$env:TEMP\k3s-verify-$ClusterId"
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

    $KubeconfigFile = "$TempDir\kubeconfig.yaml"
    $KubeconfigResponse.kubeconfig | Out-File -FilePath $KubeconfigFile -Encoding UTF8
    Write-Info "Kubeconfig saved to: $KubeconfigFile"

    # Test kubectl if available
    if (Get-Command kubectl -ErrorAction SilentlyContinue) {
        Write-Header "5. Testing kubectl Connection"

        $env:KUBECONFIG = $KubeconfigFile

        try {
            $ClusterInfo = kubectl cluster-info 2>&1
            Write-Success "kubectl can connect to cluster"

            Write-Host ""
            Write-Info "Cluster Info:"
            $ClusterInfo | ForEach-Object { Write-Host "  $_" }

            Write-Host ""
            Write-Info "Nodes:"
            kubectl get nodes -o wide | ForEach-Object { Write-Host "  $_" }

            Write-Host ""
            Write-Info "System Pods:"
            $AllPods = kubectl get pods -n kube-system --no-headers 2>&1 | Measure-Object | Select-Object -ExpandProperty Count
            $RunningPods = (kubectl get pods -n kube-system --no-headers 2>&1 | Select-String "Running" | Measure-Object).Count

            Write-Host "  Total: $AllPods"

            if ($RunningPods -eq $AllPods -and $AllPods -gt 0) {
                Write-Success "All system pods are Running ($RunningPods/$AllPods)"
            } else {
                Write-Warning "Some system pods are not Running ($RunningPods/$AllPods)"
                kubectl get pods -n kube-system | Select-String -NotMatch "Running" | ForEach-Object { Write-Host "  $_" }
            }

        } catch {
            Write-Failure "kubectl cannot connect to cluster"
            Write-Info "This might be due to firewall or networking issues"
        }
    } else {
        Write-Warning "kubectl not found, skipping connection test"
        Write-Info "Install kubectl to test cluster connectivity"
        Write-Info "Download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/"
    }
} catch {
    Write-Warning "Kubeconfig not available yet"
    Write-Info "This is normal if the cluster is still being created"
}

# 6. SSH checks (if SSH key is provided and cluster is ready)
if ($SshKey -and (Test-Path $SshKey) -and $Cluster.status -eq "READY") {
    Write-Header "6. SSH Verification on Master Node"

    if (Get-Command ssh -ErrorAction SilentlyContinue) {
        Write-Info "Attempting SSH to master: $($Cluster.masterIpAddress)"

        try {
            $TestSsh = ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o ConnectTimeout=10 -i $SshKey root@$Cluster.masterIpAddress "echo 'SSH connection successful'" 2>&1

            if ($LASTEXITCODE -eq 0) {
                Write-Success "SSH connection to master successful"

                # Check K3s service
                $K3sStatus = ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i $SshKey root@$Cluster.masterIpAddress "systemctl is-active k3s" 2>&1

                if ($K3sStatus -eq "active") {
                    Write-Success "K3s service is running on master"
                } else {
                    Write-Failure "K3s service is not running on master"
                    $ErrorCount++
                }

                # Check kubectl on master
                $NodeList = ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i $SshKey root@$Cluster.masterIpAddress "kubectl get nodes --no-headers 2>/dev/null | wc -l" 2>&1

                if ([int]$NodeList -gt 0) {
                    Write-Success "Master can list $NodeList nodes via kubectl"
                } else {
                    Write-Warning "Master kubectl returned no nodes"
                }

                # Check marker files
                $MarkerCheck = ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i $SshKey root@$Cluster.masterIpAddress "test -f /var/log/k3s-master-ready && echo 'exists'" 2>&1

                if ($MarkerCheck -eq "exists") {
                    Write-Success "K3s master initialization marker found"
                } else {
                    Write-Warning "K3s master initialization marker not found"
                }
            } else {
                Write-Warning "Cannot SSH to master node"
            }
        } catch {
            Write-Warning "Cannot SSH to master node"
            Write-Host $_.Exception.Message -ForegroundColor Yellow
        }
    } else {
        Write-Warning "SSH client not found"
        Write-Info "OpenSSH client is required for SSH checks"
    }
} else {
    if ($Cluster.status -ne "READY") {
        Write-Info "Skipping SSH checks (cluster not ready)"
    } else {
        Write-Info "Skipping SSH checks (no SSH_KEY provided)"
        Write-Info "Set SSH_KEY environment variable or use -SshKey parameter:"
        Write-Info '  $env:SSH_KEY = "C:\path\to\ssh\key"'
        Write-Info "  .\verify-cluster.ps1 -ClusterId $ClusterId -SshKey C:\path\to\ssh\key"
    }
}

# Summary
Write-Header "Verification Summary"

if ($ErrorCount -eq 0 -and $Cluster.status -eq "READY") {
    Write-Success "Cluster verification completed successfully!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Info "  1. Download kubeconfig from: $ApiUrl/infrastructure/clusters/$ClusterId/kubeconfig"
    Write-Info "  2. Set KUBECONFIG: `$env:KUBECONFIG = '$TempDir\kubeconfig.yaml'"
    Write-Info "  3. Access cluster: kubectl get nodes"
    Write-Info "  4. SSH to master: ssh root@$($Cluster.masterIpAddress)"
} else {
    Write-Warning "Cluster verification completed with $ErrorCount issues"
    Write-Info "Check the details above for more information"
}

Write-Host ""
Write-Info "Quick commands:"
Write-Info "  # Set kubeconfig"
Write-Info "  `$env:KUBECONFIG = '$TempDir\kubeconfig.yaml'"
Write-Info "  # List nodes"
Write-Info "  kubectl get nodes"
Write-Info "  # SSH to master"
Write-Info "  ssh root@$($Cluster.masterIpAddress)"

exit $ErrorCount
