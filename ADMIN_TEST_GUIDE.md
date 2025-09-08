# 管理员功能测试指南

## 功能概述
已成功实现管理员设计页面功能，包括：
1. 登录时正确存储用户信息（包含is_admin字段）
2. 导航栏根据用户是否为管理员显示设置菜单
3. 管理员设置页面组件
4. 路由配置

## 测试步骤

### 1. 配置管理员账户
在 `backend/config/app-dev.toml` 文件中添加管理员钱包地址：
```toml
[config]
admin_ids = ["0xYourAdminWalletAddress1", "0xYourAdminWalletAddress2"]
sui_network = "https://fullnode.testnet.sui.io:443"
```

### 2. 启动后端服务
```bash
cd backend
cargo run
```

### 3. 启动前端服务
```bash
cd frontend
npm run dev
```

### 4. 测试流程
1. 使用管理员钱包地址连接并登录
2. 登录成功后，导航栏将显示 "Settings" 菜单项
3. 点击 "Settings" 进入管理员设置页面
4. 验证管理员功能正常工作

### 5. 非管理员测试
1. 使用非管理员钱包地址登录
2. 验证导航栏不显示 "Settings" 菜单项
3. 尝试直接访问 `/admin` 路由，应显示 "Access Denied"

## 文件修改总结

### 前端修改
- `frontend/src/components/Auth.tsx` - 登录后重新加载页面以更新导航栏
- `frontend/src/components/GameNav.tsx` - 根据用户角色显示设置菜单
- `frontend/src/components/AdminSettings.tsx` - 管理员设置页面组件
- `frontend/src/components/AdminSettings.css` - 管理员页面样式
- `frontend/src/App.tsx` - 添加管理员路由

### 后端修改
- `backend/config/app.toml` - 添加管理员配置支持

## 功能特点
- ✅ 动态菜单显示：仅管理员可见设置菜单
- ✅ 权限验证：非管理员无法访问设置页面
- ✅ 响应式设计：适配移动端和桌面端
- ✅ 用户友好界面：清晰的管理员工具和用户信息展示

## 注意事项
- 确保后端服务正在运行（端口8000）
- 管理员钱包地址需要正确配置在配置文件中
- 首次登录后需要刷新页面才能看到设置菜单（已实现自动刷新）
