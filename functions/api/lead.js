import { json, hasTestMarker, validTest, issueReceipt } from '../_lib/security.js';
import { allowedZipCodes } from '../_lib/serviceArea.js';

export async function onRequestPost({ request, env }) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ ok: false, error: 'Origin not allowed' }, 403);
  if (!env.AW_MAKE_WEBHOOK_URL || !env.AW_TEST_SIGNING_KEY) return json({ ok: false, error: 'Online submissions are being configured. Please try again later.' }, 503);
  let body;
  try { body = Object.fromEntries(new URLSearchParams(await request.text())); }
  catch { return json({ ok: false, error: 'Invalid form' }, 400); }
  const test = hasTestMarker(body);
  if (test && !(await validTest(body, env.AW_TEST_SIGNING_KEY))) return json({ ok: false, error: 'Unauthorized test submission' }, 403);
  if (String(body.funnel_variant).toUpperCase() === 'E') {
    body.zip = String(body.zip || '').trim();
    if (!/^\d{5}$/.test(body.zip) || !allowedZipCodes.has(body.zip)) return json({ ok: false, error: 'Please enter a valid ZIP in our service area.' }, 400);
  }
  if (!body.name?.trim() || !body.email?.trim() || !body.phone?.trim() || !/^evt_[A-Za-z0-9_]+$/.test(body.lead_event_id || '')) {
    return json({ ok: false, error: 'Contact details and event ID are required' }, 400);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const upstream = await fetch(env.AW_MAKE_WEBHOOK_URL, { method: 'POST', body: new URLSearchParams(body), signal: controller.signal });
    const receipt = await upstream.json().catch(() => null);
    // Make's default "Accepted" reply is not an ingestion acknowledgment.
    if (!upstream.ok || receipt?.accepted !== true || receipt.test !== test || receipt.event_id !== body.lead_event_id
        || (!test && !receipt.id)) return json({ ok: false, error: 'We could not confirm your request. Please try again.' }, 502);
    const leadReceipt = await issueReceipt(body.lead_event_id, test, env.AW_TEST_SIGNING_KEY);
    return json({ ok: true, accepted: true, duplicate: Boolean(receipt.duplicate), test, event_id: body.lead_event_id, lead_receipt: leadReceipt });
  } catch {
    return json({ ok: false, error: 'We could not send your request. Please try again.' }, 502);
  } finally { clearTimeout(timer); }
}
