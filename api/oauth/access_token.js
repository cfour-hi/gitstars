import axios from 'axios';
import express from 'express';
// import bodyParser from 'body-parser';

const app = express();

// app.use(bodyParser.json());

app.post('/api/oauth/access_token', async (req, res) => {
  const code = req.body.code;
  const client_id = req.body.client_id;
  const client_secret = process.env.VITE_GITSTARS_CLIENT_SECRET;
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id,
      client_secret,
      code,
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });

    // 发送包含 access_token 的 JSON 数据给客户端
    res.json(response.data);
  } catch (error) {
    console.error(error);
    // 发送错误响应
    res.status(500).send('Error during GitHub OAuth');
  }
});

// 导出app
export default app;

