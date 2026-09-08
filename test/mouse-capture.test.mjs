import test from 'node:test';
import assert from 'node:assert/strict';
import { requestMouseCapture } from '../export/web/mouse-capture.js';

for (const [name, request] of [
  ['missing API', null],
  ['synchronous denial', () => { throw new Error('Unavailable'); }],
  ['rejected request', () => Promise.reject(new Error('Denied'))],
  ['silent embedded browser', () => undefined],
]) {
  test(`Play falls back once after ${name}`, async () => {
    const doc = new EventTarget();
    const element = { ownerDocument: doc, requestPointerLock: request };
    let calls = 0;
    requestMouseCapture(element, () => calls++, 5);
    await new Promise(resolve => setTimeout(resolve, 20));
    doc.dispatchEvent(new Event('pointerlockerror'));
    assert.equal(calls, 1);
  });
}

test('successful mouse capture never enables fallback', async () => {
  const doc = new EventTarget();
  const element = { ownerDocument: doc, requestPointerLock() {
    doc.pointerLockElement = element;
    doc.dispatchEvent(new Event('pointerlockchange'));
    return Promise.resolve();
  }};
  let calls = 0;
  requestMouseCapture(element, () => calls++, 5);
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(calls, 0);
});
