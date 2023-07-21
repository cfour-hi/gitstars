import { httpRequestGitstars } from './http-request';

export async function getToken(code) {
  return await httpRequestGitstars.post('https://github.com/login/oauth/access_token', {
    code,
    client_id: import.meta.env.VITE_GITSTARS_CLIENT_ID,
    client_secret: import.meta.env.VITE_GITSTARS_CLIENT_SECRET,
  });
}
