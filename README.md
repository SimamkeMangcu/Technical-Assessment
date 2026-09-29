# Android mobile and API automation

JavaScript project based on the supplied Android Automation Guide. Six WebdriverIO/Appium Android checks and two Playwright API checks. No browser download is needed for API tests.

## Current results

API: 2 passed. First emulator run: 5 passed, 1 swipe-selector failure. The selector has been corrected, but the final rerun timed out creating its Appium session, so the fix remains unverified. See VALIDATION.md for details.

## Your computer

Detected Node 20.19.5, npm 10.8.2, Java JDK 25.0.4.1, Android SDK platforms 34 and 36, build tools 36.1.0 and platform-tools. JAVA_HOME previously pointed to a missing jdk-25.0.2 folder; the Windows user setting was repaired to C:\Program Files\Java\jdk-25.0.4.1. Restart terminals to pick up persistent settings, or load scripts/env.ps1 below. Git was not found on PATH; it is optional for running tests.

## What to install

- Node.js: already installed. For a new machine use a current supported LTS from https://nodejs.org/ (Appium 3 requires Node ^20.19.0, ^22.12.0 or >=24 and npm >=10).
- Java JDK: already installed. JAVA_HOME must be the JDK folder, without a trailing bin.
- Android Studio/SDK: SDK already installed. In Android Studio SDK Manager ensure Android SDK Platform-Tools, Build-Tools, Command-line Tools (latest) and an Android SDK Platform are installed. https://developer.android.com/studio
- Project packages: npm.cmd ci when package-lock.json exists; otherwise npm.cmd install.
- UiAutomator2: load the environment script, then npm.cmd run driver:install (once; installs pinned UiAutomator2 8.7.0). It is kept in the project's ignored .appium folder.
- Git (optional, for version control): https://git-scm.com/download/win
- An Android emulator on this PC (already configured: Pixel_6, Android 14/API 34). No physical phone is required.

## Environment variables

Open PowerShell in this project and run this in EACH terminal:

```powershell
. .\scripts\env.ps1
```

The script sets these for the current terminal and child processes:

| Variable | Value |
| --- | --- |
| JAVA_HOME | Installed JDK, currently C:\Program Files\Java\jdk-25.0.4.1 |
| ANDROID_HOME | C:\Users\AnathiDayise\AppData\Local\Android\Sdk |
| ANDROID_SDK_ROOT | Same as ANDROID_HOME, for compatibility |
| APPIUM_HOME | This project's .appium folder |
| Path additions | JDK bin, SDK platform-tools, SDK cmdline-tools\latest\bin |
| ANDROID_UDID | Your emulator serial; pass -DeviceId to env.ps1 |

Do not replace your entire Windows Path. The script prepends the required folders for this terminal. No administrator rights are needed to run the project.

## Emulator and app setup (recommended for this PC)

1. Open Android Studio > Device Manager and start Pixel_6. Alternatively run: & "$env:ANDROID_HOME\emulator\emulator.exe" -avd Pixel_6 . Wait for the Android home screen.
2. Run adb devices. The emulator must appear with status device (usually emulator-5554). Use the actual listed serial. If ADB hangs, restart it with adb kill-server then adb start-server.
3. Download the pinned APK if apps/demo.apk is missing:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\download-app.ps1
```

Source: https://github.com/webdriverio/native-demo-app/releases/tag/v2.2.0 . The download script records the exact asset name and SHA256 in apps/release.txt. Downloaded does not mean mobile-tested.

4. Set your actual serial (do not use the placeholder):

```powershell
. .\scripts\env.ps1 -DeviceId 'YOUR_SERIAL_FROM_ADB'
npm.cmd run driver:install
npm.cmd run doctor
```

Appium installs the APK when the mobile suite starts. Keep the emulator running and unlocked. The mobile suite uses one device sequentially and resets app data for its session.

## Run

Terminal 1, in this project:

```powershell
. .\scripts\env.ps1
npm.cmd run appium
```

Terminal 2, in this project:

```powershell
. .\scripts\env.ps1 -DeviceId 'YOUR_SERIAL_FROM_ADB'
npm.cmd run test:api
npm.cmd run test:mobile
```

API checks can run without a phone, Android SDK or Appium server. The Appium server listens on localhost port 4723. Use npm.cmd and npx.cmd in PowerShell to avoid npm.ps1 execution-policy errors. If local scripts are blocked, use Set-ExecutionPolicy -Scope Process Bypass for this terminal, then dot-source env.ps1 again.

## Coverage and limitations

Mobile: signup confirmation, login success for valid-format input, short-password validation, form text/switch/active-button alert, horizontal carousel swipe, and mismatched signup passwords.

The guide explains that the demo app simulates signup and login; it does not store accounts or validate passwords against an account. A wrong password of eight or more characters can succeed. The negative test checks the real seven-character validation, not invalid credentials. Do not report the wrong-password requirement as passed.

The Forms Active button shows a fixed alert, not submitted form values. No dropdown coverage is claimed. The pinned APK does not expose Carousel as an accessibility label on this emulator. The swipe uses the visible first-card title to locate its vertical position, then verifies the second-card title becomes visible.

API: POST /auth token and POST /booking response. The booking test creates a record on the public Restful Booker demo service. Internet and service availability are required.

## Results

API HTML report: playwright-report/index.html. Failed mobile screenshots: evidence/. Consult VALIDATION.md for checks performed during project creation. Add device model, Android version, release, date and actual pass/fail counts after a mobile run. Review screenshots/logs for personal information before sharing. No public repository is created by these setup steps.

## References

- https://appium.io/docs/en/3.0/guides/migrating-2-to-3/
- https://github.com/appium/appium-uiautomator2-driver
- https://webdriver.io/docs/gettingstarted/
- https://playwright.dev/docs/api-testing
- https://restful-booker.herokuapp.com/apidoc/index.html


To launch the existing emulator from this project: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-emulator.ps1 . Leave its window open while testing.

Dependencies are pinned in package.json. Jest and Babel overrides avoid inconsistent registry versions encountered during setup. Keep package-lock.json with the project; use npm.cmd ci for repeat installations.

### ADB startup workaround observed on this PC

If `adb devices` or `adb start-server` hangs with no server listening, open a separate PowerShell terminal and run:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" nodaemon server
```

Leave that terminal open, then retry `adb devices` in your test terminal. This resolved the connection here, with the Pixel_6 emulator listed as emulator-5554.



## Reports and screen recordings

Run all six Android tests (with the Pixel_6 emulator and Appium server running):

```powershell
. .\scripts\env.ps1 -DeviceId emulator-5554
npm.cmd run test:mobile
```

Every run writes a dated folder under evidence/mobile/ with index.html, results.json, a screenshot and an MP4 for each completed test. Open index.html to see results and recording links. Capture failures are listed in the report; an Appium session failure cannot produce test recordings. Recordings capture the Android screen without audio, up to 180 seconds per test.

Run API tests and open their HTML evidence report:

```powershell
npm.cmd run test:api
npx.cmd playwright show-report
```

In the report, select a test and open its API request and response attachment for the status code, timestamp, duration and redacted JSON. Passwords and auth tokens are redacted. Machine-readable reports are evidence/api/results.json and evidence/api/results.xml. To share the HTML report with attachments, send the entire playwright-report folder.
