// Embedded browsers can reject mouse capture, omit the API, or never settle it.
// Keep Play usable in each case without changing browsers that support capture.
export function requestMouseCapture(element, onFallback, timeout = 1000) {
  const doc = element.ownerDocument;
  let settled = false;
  let timer;
  const finish = fallback => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    doc.removeEventListener('pointerlockchange', changed);
    doc.removeEventListener('pointerlockerror', failed);
    if (fallback) onFallback();
  };
  const changed = () => { if (doc.pointerLockElement === element) finish(false); };
  const failed = () => finish(true);
  doc.addEventListener('pointerlockchange', changed);
  doc.addEventListener('pointerlockerror', failed);
  timer = setTimeout(() => finish(doc.pointerLockElement !== element), timeout);
  try {
    if (typeof element.requestPointerLock !== 'function') return failed();
    element.requestPointerLock()?.catch(failed);
    changed();
  } catch {
    failed();
  }
}
