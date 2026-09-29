param([string]$Name = 'Pixel_6')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'env.ps1')
$emulator = Join-Path $env:ANDROID_HOME 'emulator\emulator.exe'
if (-not (Test-Path $emulator)) { throw 'Install Android Emulator through Android Studio SDK Manager.' }
# The emulator is an interactive application requested by the user.
& $emulator -avd $Name
