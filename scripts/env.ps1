param([string]$DeviceId)
# Preserve the caller's PowerShell error handling when this script is dot-sourced.
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$jdk = [Environment]::GetEnvironmentVariable('JAVA_HOME', 'User')
if (-not $jdk -or -not (Test-Path (Join-Path $jdk 'bin\javac.exe'))) {
    $jdk = Get-ChildItem 'C:\Program Files\Java' -Directory -Filter 'jdk-*' | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $jdk) { throw 'Install a JDK and set JAVA_HOME to its installation folder.' }
$env:JAVA_HOME = $jdk
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:Path"
$env:APPIUM_HOME = Join-Path (Split-Path $PSScriptRoot -Parent) '.appium'
if ($DeviceId) { $env:ANDROID_UDID = $DeviceId }
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host 'Environment ready for this terminal. Use -DeviceId SERIAL to select your emulator or phone.'


