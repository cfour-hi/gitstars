import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// 使用 body-parser middleware 解析 JSON 请求体
app.use(bodyParser.json());

app.post('/api/oauth/access_token', async (req, res) => {
  const code = req.body.code;
  const client_id = req.body.client_id;
  console.log(code, client_id);
  // 从环境变量或其他安全存储中获取 client_secret
  const client_secret = process.env.CLIENT_SECRET;
  console.log(client_secret);
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

