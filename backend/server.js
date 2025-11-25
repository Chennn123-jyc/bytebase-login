import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 创建忽略 SSL 验证的 agent（开发环境使用）
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 中间件
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '后端服务器运行正常' });
});

// GitHub OAuth 回调处理
app.post('/api/github/oauth', async (req, res) => {
  try {
    const { code } = req.body;
    
    console.log('收到 GitHub 授权码:', code);
    
    if (!code) {
      return res.status(400).json({ error: '缺少授权码' });
    }

    // 第一步：使用授权码获取访问令牌
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    }, {
      headers: {
        'Accept': 'application/json'
      },
      httpsAgent: httpsAgent  // 忽略 SSL 验证
    });

    console.log('GitHub 令牌响应:', tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      throw new Error('未收到访问令牌: ' + JSON.stringify(tokenResponse.data));
    }

    // 第二步：使用访问令牌获取用户信息
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      httpsAgent: httpsAgent  // 忽略 SSL 验证
    });

    console.log('GitHub 用户信息:', userResponse.data);

    // 第三步：获取用户邮箱信息
    let email = userResponse.data.email;
    if (!email) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
          httpsAgent: httpsAgent  // 忽略 SSL 验证
        });
        
        const primaryEmail = emailsResponse.data.find(email => email.primary);
        email = primaryEmail ? primaryEmail.email : (emailsResponse.data[0]?.email || '未提供邮箱');
      } catch (emailError) {
        console.warn('获取邮箱失败:', emailError);
        email = '未提供邮箱';
      }
    }

    // 返回用户信息
    const userInfo = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      name: userResponse.data.name || userResponse.data.login,
      email: email,
      avatar_url: userResponse.data.avatar_url,
      html_url: userResponse.data.html_url
    };

    console.log('返回用户信息:', userInfo);
    res.json(userInfo);

  } catch (error) {
    console.error('OAuth 错误:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'GitHub OAuth 认证失败',
      details: error.response?.data || error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务器运行在 http://localhost:${PORT}`);
  console.log(`⚠️  注意：当前为开发模式，已禁用 SSL 证书验证`);
});