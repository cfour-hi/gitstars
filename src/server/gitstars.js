import { httpRequestGitstars } from './http-request';

export async function getToken(code) {
  const url = import.meta.env.DEV
    ? '/api/oauth/access_token'
    : 'https://gitstars-vercel.cfour.top/api/oauth/access_token';

  return await httpRequestGitstars.post(url, {
    code,
    client_id: import.meta.env.VITE_GITSTARS_CLIENT_ID,
  });
}
