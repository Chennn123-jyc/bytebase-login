// src/components/GitHubCallback.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GitHubCallback: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已经有用户信息，说明登录成功，跳转到首页
    if (user) {
      // 延迟一点跳转，让用户看到成功消息
      const timer = setTimeout(() => {
        navigate('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  return (
    <div className="login-container">
      <div className="login-section">
        <div className="login-content">
          {user ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ color: '#7b4397', marginBottom: '20px' }}>
                🎉 登录成功！
              </h3>
              <p>正在跳转到首页...</p>
              <div style={{ marginTop: '20px' }}>
                <div className="loading" style={{ margin: '0 auto' }}></div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ marginBottom: '20px' }}>
                处理 GitHub 登录中...
              </h3>
              <p>请稍候，正在获取您的信息...</p>
              <div style={{ marginTop: '20px' }}>
                <div className="loading" style={{ margin: '0 auto' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;