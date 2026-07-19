# Contributing to CRM System

欢迎贡献代码！请遵循以下规范。

## 开发环境

```bash
# 前端
cd CRM
npm install
npm run dev

# 后端
cd backend
npm install
npm run start:dev

# 数据库
mysql -u root -p < crm.sql
```

## 代码规范

### 前端
- 使用 TypeScript，确保类型安全
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 使用 TailwindCSS 进行样式开发
- 确保 ESLint 检查通过

### 后端
- 使用 NestJS 框架
- 使用 TypeORM 进行数据库操作
- 响应格式统一为 `{ code, message, data, timestamp }`
- 控制器路由静态路径需在动态路径之前声明

## Git 规范

### 提交信息格式

```
<类型>: <描述>

<详细说明>
```

类型：
- `feat` - 新功能
- `fix` - 修复 Bug
- `docs` - 文档更新
- `style` - 代码样式（不影响功能）
- `refactor` - 重构
- `test` - 测试
- `chore` - 构建/工具

### 分支管理

- `main` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - Bug 修复分支

## 提交流程

1. Fork 仓库
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request
5. 等待代码审查

## 注意事项

- 不要提交敏感信息（密码、密钥等）
- 确保构建通过
- 添加必要的测试
- 更新相关文档

感谢你的贡献！
