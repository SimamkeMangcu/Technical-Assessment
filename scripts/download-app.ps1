$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$release = Invoke-RestMethod 'https://api.github.com/repos/webdriverio/native-demo-app/releases/tags/v2.2.0'
$assets = @($release.assets | Where-Object name -Like '*.apk')
if ($assets.Count -ne 1) { throw 'Expected one APK. Choose an Android APK from the v2.2.0 release page manually.' }
$target = Join-Path (Split-Path $PSScriptRoot -Parent) 'apps\demo.apk'
Invoke-WebRequest $assets[0].browser_download_url -OutFile $target -UseBasicParsing
@("Release: v2.2.0", "Asset: $($assets[0].name)", "SHA256: $((Get-FileHash $target -Algorithm SHA256).Hash)") | Set-Content (Join-Path $PSScriptRoot '..\apps\release.txt')
Write-Host 'Downloaded apps/demo.apk; provenance saved in apps/release.txt.'

