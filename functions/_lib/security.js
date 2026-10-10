const encoder = new TextEncoder();
const testFields = ['lead_event_id', 'submitted_at', 'funnel_variant', 'name', 'email', 'phone', 'zip', 'project_type', 'fence_type', 'sms_consent', 'test_mode'];

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

export function hasTestMarker(body) {
  return [body.lead_event_id, body.event_id].some(value => String(value || '').startsWith('evt_awtest_'))
    || ['test_mode', 'test_signature'].some(key => body[key] !== undefined && body[key] !== null && body[key] !== '');
}

export function testMessage(body) {
  return 'aw-test-v1|' + JSON.stringify(testFields.map(key => String(body[key] ?? '').trim()));
}

async function key(secret, usage) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);
}

export async function sign(message, secret) {
  const bytes = await crypto.subtle.sign('HMAC', await key(secret, 'sign'), encoder.encode(message));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function verify(message, signature, secret) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(String(signature || ''))) return false;
  const bytes = new Uint8Array(signature.match(/../g).map(pair => parseInt(pair, 16)));
  return crypto.subtle.verify('HMAC', await key(secret, 'verify'), bytes, encoder.encode(message));
}

export async function validTest(body, secret) {
  const timestamp = Date.parse(body.submitted_at || '');
  if (String(body.test_mode) !== 'true' || !/^evt_awtest_[A-Za-z0-9_]+$/.test(body.lead_event_id || '')
      || !Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 300000
      || !/^[A-E]$/.test(body.funnel_variant || '')
      || body.name !== 'Houzflow Synthetic Test' || body.email !== 'aw-test@example.com' || body.phone !== '2025550199') return false;
  return verify(testMessage(body), body.test_signature, secret);
}

function receiptMessage(receipt) {
  return `aw-receipt-v1|${receipt.event_id}|${receipt.issued_at}|${receipt.test}`;
}

export async function issueReceipt(eventId, test, secret) {
  const receipt = { event_id: eventId, issued_at: Date.now(), test };
  return { ...receipt, signature: await sign(receiptMessage(receipt), secret) };
}

export async function validReceipt(receipt, eventId, secret) {
  if (!receipt || receipt.event_id !== eventId || typeof receipt.test !== 'boolean'
      || !Number.isFinite(receipt.issued_at) || Math.abs(Date.now() - receipt.issued_at) > 300000) return false;
  return verify(receiptMessage(receipt), receipt.signature, secret);
}
