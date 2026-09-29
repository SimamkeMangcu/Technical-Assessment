const fs = require('node:fs');
const path = require('node:path');
process.env.MOBILE_RUN_ID ||= new Date().toISOString().replace(/[:.]/g, '-');
const directory = path.resolve(__dirname, '../../evidence/mobile', process.env.MOBILE_RUN_ID);
const resultFile = path.join(directory, 'results.json');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function read() { return JSON.parse(fs.readFileSync(resultFile, 'utf8')); }
function write(result) {
  fs.mkdirSync(directory, {recursive:true});
  fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
  const rows = result.tests.map(item => `<tr><td>${escape(item.title)}</td><td>${escape(item.status)}</td>
    <td>${item.durationMs ?? ''}</td><td>${item.video ? `<a href="${escape(item.video)}">MP4 recording</a>` : 'No recording'}</td>
    <td>${item.screenshot ? `<a href="${escape(item.screenshot)}">Screenshot</a>` : 'No screenshot'}</td>
    <td><pre>${escape([item.error,...item.evidenceErrors].filter(Boolean).join('\n'))}</pre></td></tr>`).join('');
  fs.writeFileSync(path.join(directory,'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><title>Android test evidence</title>
    <style>body{font:16px system-ui;margin:32px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:12px;text-align:left}pre{white-space:pre-wrap;max-width:500px}</style>
    <h1>Android test evidence</h1><p>Started: ${escape(result.startedAt)} | Run status: ${escape(result.status)}</p>
    <p>${result.tests.filter(t=>t.status==='passed').length} passed; ${result.tests.filter(t=>t.status==='failed').length} failed; ${result.tests.length} completed.</p>
    <p>Videos show the emulator screen, without audio. Capture errors are listed separately from test results.</p>
    <table><thead><tr><th>Test</th><th>Result</th><th>Duration (ms)</th><th>Video</th><th>Image</th><th>Errors</th></tr></thead><tbody>${rows}</tbody></table></html>`);
}
let recording = false;
let captureErrors = [];
module.exports = {
  onPrepare() {
    write({startedAt:new Date().toISOString(),status:'running',tests:[]});
    console.log(`Mobile report: ${path.join(directory,'index.html')}`);
  },
  async beforeTest() {
    recording = false;
    captureErrors = [];
    try {
      await browser.startRecordingScreen({timeLimit:180,videoSize:'540x1200',bitRate:1500000});
      recording = true;
    } catch(error) { captureErrors.push(`Recording could not start: ${error.message}`); console.warn(captureErrors.at(-1)); }
  },
  async afterTest(test,context,{passed,error,duration}) {
    const result = read();
    const name = `${String(result.tests.length+1).padStart(2,'0')}-${test.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}`;
    const item = {title:test.title,status:passed?'passed':'failed',durationMs:duration,error:error?.message,evidenceErrors:captureErrors};
    try {
      await browser.saveScreenshot(path.join(directory,`${name}.png`));
      item.screenshot = `${name}.png`;
    } catch(e) { item.evidenceErrors.push(`Screenshot: ${e.message}`); }
    if(recording) {
      try {
        const video = await browser.stopRecordingScreen();
        if(!video) throw new Error('Appium returned an empty recording');
        fs.writeFileSync(path.join(directory,`${name}.mp4`),Buffer.from(video,'base64'));
        item.video = `${name}.mp4`;
      } catch(e) { item.evidenceErrors.push(`Video: ${e.message}`); }
    }
    recording = false;
    result.tests.push(item);
    write(result);
    for(const message of item.evidenceErrors) console.warn(message);
  },
  onComplete(exitCode) {
    const result = read();
    result.status = exitCode===0?'passed':'failed or interrupted';
    result.finishedAt = new Date().toISOString();
    write(result);
    console.log(`Mobile report and recordings: ${directory}`);
  }
};
