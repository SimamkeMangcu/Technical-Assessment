const { test, expect } = require('@playwright/test');
async function attachExchange(testInfo, endpoint, requestBody, response, started) {
  const raw = await response.text();
  let body;
  try { body = JSON.parse(raw); } catch { body = { nonJsonResponse: true, length: raw.length }; }
  const redact = (key, value) => /password|token|authorization|cookie/i.test(key) ? '[REDACTED]' : value;
  await testInfo.attach('API request and response', {
    body: Buffer.from(JSON.stringify({
      capturedAt: new Date().toISOString(), elapsedMs: Date.now() - started,
      request: { method: 'POST', url: response.url(), endpoint, body: requestBody },
      response: { status: response.status(), body },
    }, redact, 2)),
    contentType: 'application/json',
  });
  return body;
}
test('POST /auth returns a nonempty token', async ({ request }, testInfo) => {
  const started = Date.now();
  const credentials = { username: 'admin', password: 'password123' };
  const response = await request.post('/auth', { data: credentials });
  const body = await attachExchange(testInfo, '/auth', credentials, response, started);
  expect(response.status()).toBe(200);
  expect(typeof body.token).toBe('string');
  expect(body.token.length).toBeGreaterThan(0);
});
test('POST /booking returns a matching booking', async ({ request }, testInfo) => {
  const booking = {
    firstname: 'Simamkele', lastname: 'Automation', totalprice: 250, depositpaid: true,
    bookingdates: { checkin: '2026-10-10', checkout: '2026-10-12' }, additionalneeds: 'Breakfast',
  };
  const started = Date.now();
  const response = await request.post('/booking', { data: booking });
  const body = await attachExchange(testInfo, '/booking', booking, response, started);
  expect(response.status()).toBe(200);
  expect(body.bookingid).toEqual(expect.any(Number));
  expect(body.booking).toEqual(booking);
});
