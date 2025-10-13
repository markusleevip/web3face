# 推广系统测试指南

## 系统概述
已成功实现完整的推广任务管理系统，包括：

### 后端API
1. **POST /api/promotion/tasks** - 创建推广任务
2. **GET /api/promotion/tasks** - 获取所有推广任务
3. **POST /api/promotion/:platform** - 获取社交媒体内容信息

### 前端页面
1. **Advertiser页面** - 创建推广任务
2. **PromotionTasks页面** - 查看推广任务列表

## 测试步骤

### 1. 启动服务
- 后端服务：`cd backend && cargo run` (已启动)
- 前端服务：`cd frontend && npm run dev` (已启动在 http://localhost:5174/)

### 2. 测试流程

#### 步骤1: 访问前端应用
打开浏览器访问 http://localhost:5174/

#### 步骤2: 创建推广任务
1. 导航到 Advertiser 页面
2. 选择平台 (目前支持 X/Twitter)
3. 输入有效的推文URL，例如：
   - `https://x.com/username/status/1234567890`
   - `https://twitter.com/username/status/1234567890`
4. 点击"Create Promotion Task"按钮

#### 步骤3: 查看推广任务
1. 导航到 PromotionTasks 页面
2. 应该能看到刚刚创建的推广任务
3. 可以按状态筛选任务

### 3. 预期结果

#### 创建任务时：
- 系统会调用X API获取推文信息
- 创建推广任务并保存到数据库
- 显示成功消息

#### 查看任务时：
- 从后端API获取真实数据
- 显示任务标题、描述、奖励、截止日期等
- 如果API调用失败，会显示后备的模拟数据

## 技术实现细节

### 数据库
- 使用rusty_leveldb作为键值存储
- 推广任务以JSON格式存储
- 每个任务有唯一ID

### 数据结构
```rust
pub struct PromotionTask {
    pub id: String,
    pub platform: String,
    pub url: String,
    pub title: String,
    pub description: String,
    pub reward: u64,
    pub status: String,
    pub deadline: String,
    pub requirements: Vec<String>,
    pub created_at: String,
    pub created_by: String,
    pub tweet_info: Option<TweetInfo>,
}
```

### 错误处理
- 前端有完善的错误处理机制
- API调用失败时会显示错误信息
- 获取任务列表失败时会显示模拟数据作为后备

## 注意事项
1. 需要有效的X API Bearer Token才能获取推文信息
2. 数据库文件位于 `backend/data` 目录
3. 所有API请求都需要用户认证
4. 推广任务奖励默认设置为50 SUI

## 后续改进建议
1. 实现更完善的数据库查询功能
2. 添加任务状态管理（开始、完成、审核）
3. 实现奖励发放机制
4. 添加更多社交媒体平台支持
5. 实现任务统计和分析功能
