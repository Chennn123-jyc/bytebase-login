# Bytebase 登录页面

这是一个基于 React 和 TypeScript 的 Bytebase 登录页面实现，包含 GitHub 第三方登录功能和响应式设计。

## 项目结构

```
bytebase-login/
├── public/                 # 静态资源文件
├── src/
│   ├── assets/             # 图像和SVG资源
│   │   └── WelcomeIllustration.svg  # 欢迎页SVG插画
│   ├── contexts/           # React上下文
│   │   └── AuthContext.tsx # 认证上下文，管理登录状态
│   ├── App.tsx             # 主应用组件
│   ├── App.css             # 应用样式
│   ├── index.tsx           # 应用入口点
│   └── ...                 # 其他React相关文件
├── package.json            # 项目依赖配置
└── tsconfig.json           # TypeScript配置
```

## 功能特性

- **左右分栏布局**：左侧为紫色渐变背景和欢迎插画，右侧为登录表单
- **GitHub第三方登录**：支持使用GitHub账号登录系统
- **用户信息展示**：登录成功后显示用户头像、用户名和邮箱
- **响应式设计**：适配桌面和移动设备屏幕
- **交互体验优化**：包含加载状态、按钮动画和焦点效果

## 技术栈

- React
- TypeScript
- CSS (响应式设计)
- SVG (自定义插画)
- GitHub OAuth (第三方登录)

## 使用说明

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm start
```

### 生产构建

```bash
npm run build
```

### GitHub OAuth配置

要使用真实的GitHub登录功能，需要在 GitHub 开发者设置中创建一个 OAuth 应用，并将客户端ID替换到 `src/contexts/AuthContext.tsx` 文件中的 `GITHUB_CLIENT_ID` 变量。

## 注意事项

- 本项目中的GitHub登录功能在没有配置真实客户端ID的情况下，使用模拟用户数据进行展示
- 生产环境部署时，建议将OAuth回调URL配置为实际的生产域名
- 确保在GitHub应用设置中正确配置授权范围（scope）
