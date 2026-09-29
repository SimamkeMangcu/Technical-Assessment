const path = require('node:path');
const fs = require('node:fs');
const evidence = require('./test/support/mobile-evidence');
const app = path.resolve(__dirname, 'apps/demo.apk');

// Fail before requesting an Appium session so setup errors are clear.
if (!process.env.ANDROID_UDID) throw new Error('Set ANDROID_UDID to the serial shown by adb devices.');
if (!fs.existsSync(app)) throw new Error('Missing apps/demo.apk. Run scripts/download-app.ps1.');

exports.config = {
  runner: 'local', specs: ['./test/mobile/**/*.spec.js'], maxInstances: 1,
  hostname: '127.0.0.1', port: 4723, path: '/',
  capabilities: [{
    platformName: 'Android', 'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android', 'appium:udid': process.env.ANDROID_UDID,
    'appium:app': app, 'appium:autoGrantPermissions': true, 'appium:noReset': false,
  }],
  logLevel: 'warn', framework: 'mocha', reporters: ['spec'],
  mochaOpts: { timeout: 90000 }, waitforTimeout: 10000,
  connectionRetryTimeout: 120000, connectionRetryCount: 1,
  onPrepare: evidence.onPrepare,
  beforeTest: evidence.beforeTest,
  afterTest: evidence.afterTest,
  onComplete: evidence.onComplete,
};
