# Fetch Kubeconfig from K3s Master (PowerShell)
# Usage: .\fetch-kubeconfig.ps1 -MasterIp <IP> [-SshKey <path>] [-OutputFile <path>]

param(
    [Parameter(Mandatory=$true)]
    [string]$MasterIp,

    [Parameter(Mandatory=$false)]
    [string]$SshKey = "$env:USERPROFILE\.ssh\id_rsa",

    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "kubeconfig.yaml"
)

if (-not (Test-Path $SshKey)) {
    Write-Host "Error: SSH key not found at $SshKey" -ForegroundColor Red
    Write-Host "Please specify a valid SSH key path with -SshKey parameter"
    exit 1
}

Write-Host "Fetching kubeconfig from master: $MasterIp" -ForegroundColor Cyan
Write-Host "Using SSH key: $SshKey" -ForegroundColor Cyan

# Check if SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "Error: SSH client not found" -ForegroundColor Red
    Write-Host "Please install OpenSSH client for Windows"
    exit 1
}

# SSH options
$SshOpts = "-o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -q"

# Fetch the kubeconfig from the master
Write-Host "Downloading kubeconfig from master..." -ForegroundColor Yellow

$TempFile = "$env:TEMP\kubeconfig-raw-$(Get-Random).yaml"

try {
    $result = ssh $SshOpts.Split(' ') -i $SshKey root@$MasterIp 'sudo cat /etc/rancher/k3s/k3s.yaml' 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to fetch kubeconfig from master" -ForegroundColor Red
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. Master IP is correct: $MasterIp"
        Write-Host "  2. SSH key has access: $SshKey"
        Write-Host "  3. K3s is installed on the master"
        exit 1
    }

    $result | Out-File -FilePath $TempFile -Encoding UTF8
    Write-Host "Kubeconfig downloaded successfully" -ForegroundColor Green

    # Replace 127.0.0.1 with the actual master IP
    Write-Host "Updating server URL to use master IP..." -ForegroundColor Yellow

    $kubeconfig = Get-Content $TempFile -Raw
    $kubeconfig = $kubeconfig -replace '127\.0\.0\.1', $MasterIp

    $kubeconfig | Out-File -FilePath $OutputFile -Encoding UTF8

    # Clean up temp file
    Remove-Item $TempFile -Force

    Write-Host "✓ Kubeconfig saved to: $OutputFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "To use this kubeconfig:" -ForegroundColor Cyan
    Write-Host "  `$env:KUBECONFIG = '$OutputFile'"
    Write-Host "  kubectl get nodes"
    Write-Host ""

    # Test if kubectl is available
    if (Get-Command kubectl -ErrorAction SilentlyContinue) {
        Write-Host "Testing connection..." -ForegroundColor Yellow
        $env:KUBECONFIG = $OutputFile

        $clusterInfo = kubectl cluster-info 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Connection successful!" -ForegroundColor Green
            Write-Host ""
            kubectl get nodes
        } else {
            Write-Host "⚠ Connection failed" -ForegroundColor Yellow
            Write-Host "This might be due to:" -ForegroundColor Yellow
            Write-Host "  1. Port 6443 not open on the master firewall"
            Write-Host "  2. K3s not fully initialized yet"
            Write-Host ""
            Write-Host "Try testing from the master first:" -ForegroundColor Cyan
            Write-Host "  ssh -i $SshKey root@$MasterIp 'kubectl get nodes'"
        }
    } else {
        Write-Host "kubectl not found - skipping connection test" -ForegroundColor Yellow
        Write-Host "Install kubectl to test the connection"
    }

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if (Test-Path $TempFile) {
        Remove-Item $TempFile -Force
    }
    exit 1
}
