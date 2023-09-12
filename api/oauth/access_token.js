export const config = {
  runtime: 'edge',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async (request, context) => {
  if (request.method === 'OPTIONS') {
    return new Response('OK', {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  const requestBody = await request.json();
  if (!requestBody.client_secret) {
    requestBody.client_secret = process.env.VITE_GITSTARS_CLIENT_SECRET;
  }

  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (e) {
    console.error(e);
    return new Response(e.message);
  }
};
