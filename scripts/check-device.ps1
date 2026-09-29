param([int]$TimeoutSeconds = 15)
$ErrorActionPreference = 'Stop'
$adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = $adb
$startInfo.Arguments = 'devices'
$startInfo.UseShellExecute = $false
$startInfo.CreateNoWindow = $true
$startInfo.RedirectStandardOutput = $true
$startInfo.RedirectStandardError = $true
$process = [System.Diagnostics.Process]::Start($startInfo)
if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
    $process.Kill()
    throw 'adb devices timed out. Close other Android tools, reconnect your unlocked phone and retry. If needed, run adb kill-server and adb start-server manually.'
}
Write-Output $process.StandardOutput.ReadToEnd()
Write-Output $process.StandardError.ReadToEnd()
exit $process.ExitCode
