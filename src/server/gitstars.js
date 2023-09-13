import { httpRequestGitstars } from './http-request';

export async function getToken(code) {
  return await httpRequestGitstars.post('/api/oauth/access_token', {
    code,
    client_id: import.meta.env.VITE_GITSTARS_CLIENT_ID,
  });
}
