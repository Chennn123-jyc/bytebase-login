// src/contexts/AuthContext.tsx
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

  // 使用授权码交换用户信息（使用 Netlify 函数）
  const exchangeCodeForUserInfo = async (code: string): Promise<User> => {
    try {
      // 使用 Netlify 函数
      const netlifyFunctionURL = 'https://bytebase-login-backend.netlify.app/.netlify/functions/github-oauth';
      
      console.log('正在调用 Netlify 函数:', netlifyFunctionURL);
      
      const response = await fetch(netlifyFunctionURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      console.log('收到响应，状态:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '请求失败');
      }

      return await response.json();
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new Error(`GitHub OAuth 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 处理 GitHub 回调
  const handleGitHubCallback = async (code: string) => {
    setIsLoggingIn(true);
    
    try {
      console.log('开始处理 GitHub 回调，授权码:', code);
      
      const userInfo = await exchangeCodeForUserInfo(code);
      console.log('成功获取用户信息:', userInfo);
      
      setUser(userInfo);
      localStorage.setItem('github_user', JSON.stringify(userInfo));
      
      // 清除 URL 中的参数，回到首页
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      console.log('登录成功，已清除URL参数');
      
    } catch (error) {
      console.error('GitHub 登录失败:', error);
      
      let errorMessage = 'GitHub 登录失败，请重试';
      if (error instanceof Error) {
        errorMessage = `GitHub 登录失败: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // GitHub 登录
  const loginWithGitHub = () => {
    setIsLoggingIn(true);
    
    // 使用硬编码的重定向 URI（因为环境变量有问题）
    const redirectUri = 'https://chennn123-jyc.github.io/bytebase-login';
    const clientId = 'Ov23limToHvPqFDn9D8m';
    
    // 构建 GitHub OAuth 授权 URL
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    
    console.log('GitHub 授权 URL:', authUrl);
    
    // 重定向到 GitHub 授权页面
    window.location.href = authUrl;
  };

  // 退出登录
  const logout = () => {
    setUser(null);
    localStorage.removeItem('github_user');
  };

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
      console.log('发现授权码，开始处理回调:', code);
      handleGitHubCallback(code);
    }
  }, []);

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