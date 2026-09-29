const { $, driver, expect } = require('@wdio/globals');
const byId = (id) => $(`~${id}`);
const byText = (value) => $(`android=new UiSelector().text(${JSON.stringify(value)})`);

async function openTab(name, screenId) {
  await byId(name).click();
  await expect(byId(screenId)).toBeDisplayed();
}

async function enterCredentials(email, password, confirmation) {
  await byId('input-email').setValue(email);
  await byId('input-password').setValue(password);
  if (confirmation !== undefined) await byId('input-repeat-password').setValue(confirmation);
  if (await driver.isKeyboardShown()) await driver.hideKeyboard();
}

async function expectAlert(title, message) {
  await driver.waitUntil(async () => {
    try { return (await driver.getAlertText()).includes(message); }
    catch { return false; }
  }, { timeout: 10000, timeoutMsg: `Expected alert message: ${message}` });
  const actual = await driver.getAlertText();
  expect(actual).toContain(title);
  expect(actual).toContain(message);
  await driver.acceptAlert();
}

async function swipeLeft(element) {
  const { y } = await element.getLocation();
  const { height } = await element.getSize();
  const { width } = await driver.getWindowRect();
  // Swipe across the body of the card, above its text label.
  await driver.execute('mobile: swipeGesture', {
    left: Math.round(width * 0.05),
    top: Math.round(y - height * 5),
    width: Math.round(width * 0.75),
    height: Math.round(height * 4),
    direction: 'left', percent: 0.9, speed: 1200,
  });
}
describe('Native Demo App on Android', () => {
  it('signs up and shows confirmation', async () => {
    await openTab('Login', 'Login-screen');
    await byId('button-sign-up-container').click();
    await enterCredentials(`automation.${Date.now()}@example.com`, 'Password123!', 'Password123!');
    await byId('button-SIGN UP').click();
    await expectAlert('Signed Up!', 'You successfully signed up!');
  });

  it('logs in with valid-format input and shows success', async () => {
    await openTab('Login', 'Login-screen');
    await byId('button-login-container').click();
    await enterCredentials('automation@example.com', 'Password123!');
    await byId('button-LOGIN').click();
    await expectAlert('Success', 'You are logged in!');
  });

  it('rejects a password shorter than eight characters', async () => {
    await openTab('Login', 'Login-screen');
    await byId('button-login-container').click();
    await enterCredentials('automation@example.com', 'Wrong12');
    await byId('button-LOGIN').click();
    await expect(byText('Please enter at least 8 characters')).toBeDisplayed();
  });

  it('reflects form input, toggle state and submit alert', async () => {
    await openTab('Forms', 'Forms-screen');
    await byId('text-input').setValue('Automation works');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await expect(byId('input-text-result')).toHaveText('Automation works');
    if ((await byId('switch').getAttribute('checked')) !== 'true') await byId('switch').click();
    await expect(byId('switch-text')).toHaveText('Click to turn the switch OFF');
    await byId('button-Active').click();
    await expectAlert('This button is', 'This button is active');
  });

  it('swipes horizontally to the next carousel slide', async () => {
    await openTab('Swipe', 'Swipe-screen');
    await expect(byText('FULLY OPEN SOURCE')).toBeDisplayed();
    // Android marks off-screen carousel cards as displayed; verify their position instead.
    const nextCard = byText('GREAT COMMUNITY');
    const centerX = async () => {
      const { x } = await nextCard.getLocation();
      const { width } = await nextCard.getSize();
      return x + width / 2;
    };
    const beforeX = await centerX();
    const { width: screenWidth } = await driver.getWindowRect();
    await swipeLeft(byText('FULLY OPEN SOURCE'));
    await driver.waitUntil(async () => {
      const afterX = await centerX();
      return afterX > screenWidth * 0.15 && afterX < screenWidth * 0.85
        && Math.abs(afterX - beforeX) > screenWidth * 0.2;
    }, { timeout: 10000, timeoutMsg: 'The next carousel card did not move into the visible area after swiping' });
    await expect(nextCard).toBeDisplayed();
  });

  it('bonus: rejects mismatching signup passwords', async () => {
    await openTab('Login', 'Login-screen');
    await byId('button-sign-up-container').click();
    await enterCredentials('automation@example.com', 'Password123!', 'Different123!');
    await byId('button-SIGN UP').click();
    await expect(byText('Please enter the same password')).toBeDisplayed();
  });
});



