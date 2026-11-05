const normalizeEmail = (email) => email.trim().toLowerCase();
const isEmail = (value) => typeof value === 'string' && value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);

function loadCodes() {
  const config = JSON.parse(process.env.PROMO_CODES_JSON ?? 'null');
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Invalid promo configuration');
  const codes = new Map();
  const assigned = new Set();
  for (const [email, code] of Object.entries(config)) {
    const key = normalizeEmail(email);
    if (!isEmail(key) || codes.has(key) || typeof code !== 'string' ||
        !code || code.trim() !== code || assigned.has(code)) {
      throw new Error('Invalid promo assignment');
    }
    codes.set(key, code);
    assigned.add(code);
  }
  return codes;
}

const reply = (status, data, headers = {}) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers }
});

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return reply(405, { error: 'Method not allowed.' }, { Allow: 'POST' });
    }
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return reply(415, { error: 'Expected a JSON request.' });
    }
    let email;
    try {
      const body = await request.text();
      if (body.length > 1024) return reply(413, { error: 'Request is too large.' });
      const input = JSON.parse(body)?.email;
      if (typeof input === 'string') email = normalizeEmail(input);
    } catch {
      return reply(400, { error: 'Enter a valid email address.' });
    }
    if (!isEmail(email)) return reply(400, { error: 'Enter a valid email address.' });

    try {
      const code = loadCodes().get(email);
      if (!code) return reply(404, { error: 'We couldn’t find a code for that email. Check the address on your invite and try again.' });
      return reply(200, { code });
    } catch {
      return reply(503, { error: 'Code lookup is temporarily unavailable. Please try again later.' });
    }
  }
};
