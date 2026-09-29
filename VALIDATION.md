# Validation - 2026-09-28

## Completed setup

- Node 20.19.5 and npm 10.8.2 detected.
- JAVA_HOME repaired at Windows user scope to C:\Program Files\Java\jdk-25.0.4.1.
- Android SDK already present, with API 34 and 36 platforms.
- Project dependencies installed; package-lock.json generated.
- Appium 3.0.2 and UiAutomator2 8.7.0 installed.
- Appium doctor: 0 required fixes. Optional bundletool, ffmpeg and GStreamer are not needed for these tests.
- Official demo APK v2.2.0 downloaded; asset name and SHA256 recorded in apps/release.txt.
- JavaScript syntax checks and PowerShell script parser checks passed during setup.

## Actual execution on this PC

API suite: 2 passed, 0 failed (14 seconds). Report: playwright-report/index.html.

Mobile platform: existing Pixel_6 emulator, Android 14/API 34, emulator-5554. No physical phone was used. Boot completion and ADB connection were confirmed.

First mobile run: 5 passed, 1 failed. Signup, login, short-password validation, form checks and signup password mismatch passed. The swipe failed because the APK does not expose the Carousel accessibility label. The failure screenshot is in evidence/.

The swipe implementation was changed to use the visible card title and screen dimensions, with a before/after visibility assertion. This fix is NOT yet confirmed by a successful completed rerun.

The next run reached session cleanup but PowerShell log capture mishandled stderr and lost the summary. Log capture was corrected. The final rerun timed out while creating the Appium session, before tests executed; see evidence/mobile-run.log. ADB reported socket-flush timeouts and Windows commands became very slow. The exact cause was not established. Do not claim all mobile tests passed.

## Repeat the mobile run

1. Close unused applications to free resources and restart the Pixel_6 emulator using Android Studio Device Manager or scripts/start-emulator.ps1.
2. Load scripts/env.ps1 in both terminals. Run adb devices and wait for emulator-5554 to have status device.
3. If ADB hangs before a server starts, run adb nodaemon server in another terminal and leave it open. This workaround initially resolved device discovery here.
4. Start Appium with npm.cmd run appium if no server is already listening on localhost:4723.
5. In the test terminal: . .\scripts\env.ps1 -DeviceId emulator-5554, then npm.cmd run test:mobile.

The emulator launched during setup was requested to stop after the final timeout to free PC resources. The local Appium/ADB services may remain running; restart them if they are unresponsive.
