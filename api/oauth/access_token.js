export const config = {
  runtime: 'edge',
};

async function toJSON(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const chunks = [];

  async function read() {
    const { done, value } = await reader.read();
    if (done) {
      return JSON.parse(chunks.join(''));
    }

    const chunk = decoder.decode(value, { stream: true });
    chunks.push(chunk);
    return read();
  }

  return read();
}

export default async (request) => {
  const requestBodyJson = await toJSON(request.body);
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: JSON.stringify({
        code: requestBodyJson.code,
        client_id: requestBodyJson.client_id,
        client_secret: process.env.VITE_GITSTARS_CLIENT_SECRET,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const data = await res.json();
    return new Response(JSON.stringify(data));
  } catch (e) {
    console.error(e);
    return new Response(e.message);
  }
};
