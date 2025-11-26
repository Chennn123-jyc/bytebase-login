import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 导入所有图标
import { ReactComponent as GoogleIcon } from './assets/g.svg';
import { ReactComponent as GitHubIcon } from './assets/github.svg';
import { ReactComponent as MicrosoftIcon } from './assets/windows.svg';
import { ReactComponent as BytebaseLogo } from './assets/logo.svg';

// 添加路由调试组件
const RouteDebugger: React.FC = () => {
  const location = useLocation();
  console.log('当前路由:', location.pathname);
  console.log('查询参数:', location.search);
  console.log('Hash:', location.hash);
  return null;
};

/**
 * 登录页面组件
 */
function LoginPage() {
  const { user, loginWithGitHub, logout, isLoggingIn } = useAuth();
  const location = useLocation();
  
  // 添加调试信息
  console.log('LoginPage - 当前路由:', location.pathname);
  console.log('LoginPage - 查询参数:', location.search);
  console.log('LoginPage - 用户状态:', user);
  console.log('LoginPage - 登录中:', isLoggingIn);

  if (user) {
    return (
      <div className="login-container">
        <div className="login-section">
          <div className="login-content">
            <div className="user-info">
              <div className="logo-container">
                <BytebaseLogo className="bytebase-logo" />
              </div>
              
              <img 
                src={user.avatar_url} 
                alt="用户头像" 
                className="user-avatar" 
              />
              
              <h3>🎉 欢迎回来，{user.name}！</h3>
              
              <div className="user-details">
                <div className="user-detail-item">
                  <span className="detail-label">GitHub用户名:</span>
                  <span className="detail-value">@{user.login}</span>
                </div>
                
                <div className="user-detail-item">
                  <span className="detail-label">邮箱:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                
                <div className="user-detail-item">
                  <span className="detail-label">GitHub主页:</span>
                  <a 
                    href={user.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="github-link"
                  >
                    访问我的 GitHub
                  </a>
                </div>
              </div>
              
              <button className="logout-button" onClick={logout}>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="login-container">
      <div className="login-section">
        <div className="login-content">
          <div className="logo-container">
            <BytebaseLogo className="bytebase-logo" />
          </div>
          <h3>欢迎</h3>
          <p className="login-description">登录 Bytebase 以继续使用 Bytebase Hub。</p>
          <div className="oauth-buttons">
            <button className="oauth-button google" disabled>
              <GoogleIcon className="oauth-icon-svg" />
              继续使用 Google
            </button>
            
            <button 
              className="oauth-button github" 
              onClick={loginWithGitHub} 
              disabled={isLoggingIn}
            >
              <GitHubIcon className="oauth-icon-svg" />
              {isLoggingIn ? (
                <span>
                  <span className="loading" style={{ marginRight: '8px' }}></span>
                  登录中...
                </span>
              ) : (
                '继续使用 GitHub'
              )}
            </button>
            
            <button className="oauth-button microsoft" disabled>
              <MicrosoftIcon className="oauth-icon-svg" />
              继续使用 Microsoft Account
            </button>
          </div>
          
          <div className="divider">或</div>
          
          <div className="email-login">
            <input 
              type="email" 
              placeholder="电子邮件地址"
              className="email-input"
              disabled
            />
            <button className="continue-button" disabled>继续</button>
            <div className="signup-link">
              没有账户？<a href="https://github.com/signup" target="_blank" rel="noopener noreferrer">注册</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteDebugger />
        <Routes>
          {/* 只有一个路由，所有路径都渲染 LoginPage */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;