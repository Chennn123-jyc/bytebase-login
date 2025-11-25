import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 用户信息接口
interface User {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
}

// 认证上下文接口
interface AuthContextType {
  user: User | null;
  loginWithGitHub: () => void;
  logout: () => void;
  isLoggingIn: boolean;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证 Provider 组件属性接口
interface AuthProviderProps {
  children: ReactNode;
}

// 认证 Provider 组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // GitHub OAuth 配置
  const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.REACT_APP_GITHUB_CLIENT_SECRET;
  const GITHUB_REDIRECT_URI = process.env.REACT_APP_GITHUB_REDIRECT_URI;

  // 初始化检查本地存储的用户信息
  useEffect(() => {
    const savedUser = localStorage.getItem('github_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  
    // 检查 URL 中是否有授权码（回调处理）
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleGitHubCallback(code);
    }
  }, []);

  // 处理 GitHub 回调
  const handleGitHubCallback = async (code: string) => {
    setIsLoggingIn(true);
    
    try {
      console.log('开始处理 GitHub 回调，授权码:', code);
      
      const userInfo = await exchangeCodeForUserInfo(code);
      console.log('成功获取用户信息:', userInfo);
      
      setUser(userInfo);
      localStorage.setItem('github_user', JSON.stringify(userInfo));
      
      // 清除 URL 中的参数 - 确保这行代码执行
      window.history.replaceState({}, document.title, '/');
      console.log('登录成功，已清除URL参数');
      
    } catch (error) {
      console.error('GitHub 登录失败:', error);
      // 错误处理...
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 使用授权码交换用户信息（真实实现）
  const exchangeCodeForUserInfo = async (code: string): Promise<User> => {
    try {
      console.log('正在向后端发送授权码...', code);
      
      const response = await fetch('http://localhost:5000/api/github/oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });
  
      console.log('后端响应状态:', response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('后端错误响应:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      const userData = await response.json();
      console.log('从后端收到的用户数据:', userData);
      
      return userData;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      
      // 修复错误2：安全地处理 unknown 类型的 error
      let errorMessage = '连接后端失败';
      if (error instanceof Error) {
        errorMessage = `连接后端失败: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `连接后端失败: ${error}`;
      }
      
      throw new Error(errorMessage);
    }
  };

  // GitHub 登录
  // GitHub 登录
const loginWithGitHub = () => {
  setIsLoggingIn(true);
  
  // 构建 GitHub OAuth 授权 URL
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI || '')}&scope=user:email`;
  
  // 重定向到 GitHub 授权页面
  window.location.href = authUrl;
  
};

  // 退出登录
  const logout = () => {
    setUser(null);
    localStorage.removeItem('github_user');
  };

  const value: AuthContextType = {
    user,
    loginWithGitHub,
    logout,
    isLoggingIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用认证上下文的 Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};