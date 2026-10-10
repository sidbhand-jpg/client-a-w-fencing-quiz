import { validReceipt, hasTestMarker, validTest } from '../_lib/security.js';
const encoder = new TextEncoder();

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function hashedValues(values) {
  const normalized = values.map(normalize).filter(Boolean);
  return Promise.all(normalized.map(sha256));
}

function cleanPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 10 ? `1${digits}` : digits;
}

export async function onRequestPost({ request, env }) {
  const requestUrl = new URL(request.url);
  if (request.headers.get("origin") !== requestUrl.origin) {
    return json({ ok: false, error: "Origin not allowed" }, 403);
  }

  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) {
    return json({ ok: false, error: "CAPI is not configured" }, 503);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ ok: false, error: 'Invalid event' }, 400);

  const eventId = String(input.event_id || "").trim();
  const eventName = String(input.event_name || 'Lead');
  if (!['PageView', 'FunnelStep', 'Lead'].includes(eventName)) return json({ ok: false, error: 'Invalid event name' }, 400);
  if (!/^evt_[a-zA-Z0-9_]+$/.test(eventId)) {
    return json({ ok: false, error: "Invalid event ID" }, 400);
  }

  const email = normalize(input.email);
  const phone = cleanPhone(input.phone);
  let test = false;
  if (eventName === 'Lead') {
    if (!(await validReceipt(input.lead_receipt, eventId, env.AW_TEST_SIGNING_KEY))) return json({ ok: false, error: 'Accepted lead receipt required' }, 403);
    test = input.lead_receipt.test;
  } else if (hasTestMarker(input)) {
    if (!(await validTest(input, env.AW_TEST_SIGNING_KEY)) || input.lead_event_id !== eventId) return json({ ok: false, error: 'Unauthorized test event' }, 403);
    test = true;
  }
  if (test && !env.META_TEST_EVENT_CODE) return json({ ok: false, error: 'Meta test events are not configured' }, 503);
  if (eventName === 'Lead' && (!email || !phone)) {
    return json({ ok: false, error: "Email and phone are required" }, 400);
  }

  const nameParts = normalize(input.name).split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() || "";
  const lastName = nameParts.join(" ");
  const userData = {
    em: await hashedValues([email]),
    ph: await hashedValues([phone]),
    fn: await hashedValues([firstName]),
    ln: await hashedValues([lastName]),
    zp: await hashedValues([String(input.zip || "").slice(0, 5)]),
    country: await hashedValues(["us"]),
    client_ip_address: request.headers.get("CF-Connecting-IP") || undefined,
    client_user_agent: String(input.user_agent || request.headers.get("user-agent") || ""),
    fbp: /^fb\.\d\.\d+\.\d+$/.test(input.fbp || '') ? input.fbp : undefined,
    fbc: /^fb\.\d\.\d+\.[A-Za-z0-9_-]+$/.test(input.fbc || '') ? input.fbc : undefined,
  };

  Object.keys(userData).forEach(key => {
    const value = userData[key];
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) delete userData[key];
  });

  let sourceUrl = requestUrl.origin;
  try {
    const candidateSourceUrl = new URL(String(input.source_url || requestUrl.origin));
    if (candidateSourceUrl.origin === requestUrl.origin) sourceUrl = candidateSourceUrl.href;
  } catch {
    // Keep the verified same-origin fallback.
  }
  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      event_source_url: sourceUrl,
      user_data: userData,
      custom_data: {
        variant: String(input.variant || '').slice(0, 10),
        ...(eventName === 'FunnelStep' ? { step: String(input.step || '').slice(0, 100) } : {}),
      },
    }],
  };
  // Never route ordinary production traffic into Test Events.
  if (test) payload.test_event_code = env.META_TEST_EVENT_CODE;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  let metaResponse;
  try {
    metaResponse = await fetch(`https://graph.facebook.com/${env.META_PIXEL_ID}/events`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.META_CAPI_ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  } catch {
    return json({ ok: false, error: 'Meta request failed' }, 502);
  } finally { clearTimeout(timer); }
  const metaBody = await metaResponse.json().catch(() => ({}));

  if (!metaResponse.ok || metaBody.events_received !== 1) {
    console.error("Meta CAPI rejected event", metaResponse.status, metaBody.error?.code || "unknown");
    return json({ ok: false, error: "Meta rejected the event" }, 502);
  }

  return json({ ok: true, events_received: 1, event_id: eventId, event_name: eventName, test });
}
