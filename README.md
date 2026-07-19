# CRM 客户关系管理系统

> 基于 React + TypeScript + Vite + NestJS + MySQL 的现代化企业级客户关系管理系统

![License](https://img.shields.io/github/license/YZ0322/CRM?style=flat-square)
![Stars](https://img.shields.io/github/stars/YZ0322/CRM?style=flat-square)
![Forks](https://img.shields.io/github/forks/YZ0322/CRM?style=flat-square)
![Issues](https://img.shields.io/github/issues/YZ0322/CRM?style=flat-square)

## ✨ 功能特性

- 📊 **仪表盘** - 数据可视化统计、订单状态分布、实时数据展示
- 👥 **客户管理** - 客户信息管理、回访记录、标签分组、四级地址选择
- 📦 **订单管理** - 订单创建、审核流程、发货管理、物流追踪
- 🏪 **商品管理** - 商品信息维护、分类管理、库存监控
- 📋 **库存管理** - 库存详情查看、库存调整、库存预警
- 📝 **操作日志** - 系统操作记录、统计分析图表、安全审计
- ⚙️ **系统设置** - 数据备份、主题切换、系统配置
- 🔐 **权限管理** - 角色权限控制、多级权限体系

## 🛠️ 技术栈

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| TailwindCSS | 3.x | CSS 框架 |
| Lucide React | 0.x | 图标库 |
| React Router DOM | 7.x | 路由管理 |
| Zustand | 5.x | 状态管理 |
| Axios | 1.x | HTTP 客户端 |

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| NestJS | 11.x | 后端框架 |
| TypeORM | 1.x | ORM 框架 |
| MySQL | 8.0+ | 数据库 |
| JWT | - | 认证授权 |
| Swagger | - | API 文档 |

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- MySQL >= 8.0

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/YZ0322/CRM.git
cd CRM

# 2. 安装前端依赖
npm install

# 3. 安装后端依赖
cd backend
npm install

# 4. 配置数据库
# 创建数据库
mysql -u root -p -e "CREATE DATABASE crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入初始化数据
mysql -u root -p crm < ../crm.sql

# 5. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写数据库密码等配置

# 6. 启动服务
# 启动后端（开发模式）
npm run start:dev

# 启动前端（新终端）
cd ..
npm run dev
```

### 访问地址
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000
- **Swagger 文档**: http://localhost:3000/api/docs

### 默认账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 超级管理员 |
| manager | manager123 | 管理员 |
| warehouse | warehouse123 | 仓库管理员 |
| user | user123 | 普通成员 |

## 📁 项目结构

```
crm/
├── src/                    # 前端源码
│   ├── api/               # API 接口封装
│   ├── components/        # 公共组件
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 工具函数
│   ├── pages/             # 页面组件
│   ├── App.tsx            # 路由配置
│   └── main.tsx           # 入口文件
├── backend/               # 后端源码
│   ├── src/
│   │   ├── auth/          # 认证模块
│   │   ├── customer/      # 客户管理模块
│   │   ├── order/         # 订单管理模块
│   │   ├── product/       # 商品管理模块
│   │   ├── operation_log/ # 操作日志模块
│   │   ├── backup/        # 数据备份模块
│   │   ├── common/        # 公共模块
│   │   ├── entities/      # 数据库实体
│   │   └── main.ts        # 入口文件
│   ├── .env.example       # 环境变量模板
│   └── package.json       # 依赖配置
├── crm.sql                # 数据库初始化脚本
├── LICENSE                # MIT 许可证
├── CONTRIBUTING.md        # 贡献指南
├── PROJECT_DOC.md         # 项目详细文档
└── README.md              # 项目介绍
```

## 📈 功能模块

### 仪表盘
- 数据概览卡片（订单数、客户数、商品数、销售额）
- 订单状态分布图表
- 最近订单列表
- 销售趋势图

### 客户管理
- 客户列表展示（搜索、筛选、分页）
- 客户详情查看
- 客户新增/编辑/删除
- 客户回访记录管理
- 客户标签管理

### 订单管理
- 订单列表展示（状态筛选）
- 订单创建
- 订单审核（通过/拒绝）
- 订单发货（物流信息填写）
- 订单详情查看

### 商品管理
- 商品列表展示
- 商品分类管理
- 商品新增/编辑/删除

### 库存管理
- 库存列表展示
- 库存详情查看
- 库存调整（直接输入、保存确认）

### 操作日志
- 日志列表展示（筛选、分页）
- 统计图表（近7天趋势、操作类型分布）
- 活跃用户排行
- 模块操作分布

### 系统设置
- 数据备份与下载
- 深色/浅色主题切换

## 🔧 API 接口

### 认证模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/profile` | 获取用户信息 |

### 客户模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/customers` | 获取客户列表 |
| POST | `/api/customers` | 创建客户 |
| GET | `/api/customers/:id` | 获取客户详情 |
| PUT | `/api/customers/:id` | 更新客户 |
| DELETE | `/api/customers/:id` | 删除客户 |

### 订单模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders` | 获取订单列表 |
| POST | `/api/orders` | 创建订单 |
| PUT | `/api/orders/:id/approve` | 审核通过 |
| PUT | `/api/orders/:id/reject` | 审核拒绝 |
| PUT | `/api/orders/:id/ship` | 发货 |

### 商品模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/products` | 获取商品列表 |
| POST | `/api/products` | 创建商品 |
| GET | `/api/products/stock` | 获取库存列表 |
| PUT | `/api/products/stock/:id` | 更新库存 |

## 🤝 贡献指南

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献流程。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 💡 备注

1. 所有密码使用 BCrypt 加密
2. 数据库脚本包含完整的初始化数据
3. 支持深色模式，主题设置持久化到 localStorage
4. 操作日志自动记录系统操作
5. 数据备份功能支持创建和下载数据库备份

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
