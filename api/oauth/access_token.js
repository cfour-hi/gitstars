const axios = require('axios');

module.exports = async (req, res) => {
  // 获取请求参数
  const { code, client_id } = req.body;

  // 从环境变量中获取 secret
  const client_secret = process.env.CLIENT_SECRET;

  try {
    // 请求 GitHub 的 OAuth 认证接口
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id,
      client_secret,
      code,
    }, {
      headers: {
        accept: 'application/json'
      }
    });

    // 返回 access token
    res.json(response.data);
  } catch (error) {
    // 处理请求错误
    console.error(error);

    // 如果错误信息存在于响应中，则返回它
    if (error.response && error.response.data) {
      res.status(500).json(error.response.data);
    } else {
      // 否则返回通用错误信息
      res.status(500).json({ error: 'An error occurred while requesting the access token.' });
    }
  }
};
