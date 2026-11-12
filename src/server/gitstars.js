import { httpRequestGitstars } from './http-request';

export function getToken(code) {
  return httpRequestGitstars.post('/api/oauth/access_token', {
    code,
    client_id: import.meta.env.VITE_GITSTARS_CLIENT_ID,
  });
}
