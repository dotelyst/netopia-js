const netopiaLiveEndpoint = 'https://secure.netopia-payments.com';
const netopiaSandboxEndpoint =
  process.env.NETOPIA_SANDBOX_ENDPOINT ||
  'https://secure.sandbox.netopia-payments.com';
const netopiaUseSandbox = process.env.NETOPIA_USE_SANDBOX === 'true';
const netopiaApiKey = process.env.NETOPIA_API_KEY;

const base = netopiaUseSandbox ? netopiaSandboxEndpoint : netopiaLiveEndpoint;

export const callNetopia = async (path: string, method: string, data?: any) => {
  if (!netopiaApiKey) {
    throw new Error('NETOPIA_API_KEY is missing from environment variables.');
  }

  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: netopiaApiKey,
      'Content-Type': 'application/json',
    },
    body: method === 'POST' ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Netopia API error: ${response.status} ${response.statusText}`,
      );
    }
  }

  return response.json();
};
