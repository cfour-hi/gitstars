import express from 'express';
import cors from 'cors';
import access_token from './api/oauth/access_token.js';
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: process.env.ENV_FILE || '.env' });
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/oauth/access_token', access_token);

const PORT = process.env.SERVER_PORT || 3000;
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
