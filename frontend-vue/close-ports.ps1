# PowerShell script to close ports 5173 and 3001
$ports = @(5173, 3001)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen
    foreach ($conn in $connections) {
        $processId = $conn.OwningProcess
        if ($processId) {
            Write-Host "Stopping process $processId on port $port"
            Stop-Process -Id $processId -Force
        }
    }
}
Write-Host "Ports closed. You can now restart your servers."
