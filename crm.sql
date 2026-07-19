CREATE DATABASE IF NOT EXISTS `crm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `crm`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `role` ENUM('super_admin', 'admin', 'warehouse_admin', 'member') NOT NULL DEFAULT 'member' COMMENT '角色',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态(0禁用,1启用)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

INSERT INTO `users` (`username`, `password`, `email`, `phone`, `role`, `status`) VALUES
('admin', '$2b$10$T09mK34EezsZLoxVhhXjBe4bb2KZV8ljsZWlZ8fNHX52gKBoO0u.m', 'admin@crm.com', '13800138001', 'super_admin', 1),
('manager', '$2b$10$jOD2qPzfA23kV48dYkjM4u8sQ8Bbql/AEqOMi9/ZKJhBphp/8t1ja', 'manager@crm.com', '13800138002', 'admin', 1),
('warehouse', '$2b$10$gI/gV8Q3menf8UxOtjjJV.4EstpH9X/WoOu.xNVy/RTB/Ou4qkDs.', 'warehouse@crm.com', '13800138003', 'warehouse_admin', 1),
('user', '$2b$10$ujX7Ob.YpzMAcooJFPuoW.V.T7EX0R5Jlllf03RD9ZSow.HgdxAjO', 'user@crm.com', '13800138004', 'member', 1);

CREATE TABLE IF NOT EXISTS `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

INSERT INTO `roles` (`name`, `code`, `description`) VALUES
('超级管理员', 'super_admin', '拥有系统全部权限'),
('管理员', 'admin', '管理日常业务，可审核订单'),
('仓库管理员', 'warehouse_admin', '管理库存和采购'),
('普通成员', 'member', '基础业务操作权限');

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) NOT NULL COMMENT '权限编码',
  `module` VARCHAR(50) NOT NULL COMMENT '所属模块',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '权限描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

INSERT INTO `permissions` (`name`, `code`, `module`, `description`) VALUES
('查看仪表盘', 'dashboard:view', 'dashboard', '查看仪表盘数据'),
('客户列表', 'customer:list', 'customer', '查看客户列表'),
('创建客户', 'customer:create', 'customer', '创建新客户'),
('编辑客户', 'customer:edit', 'customer', '编辑客户信息'),
('删除客户', 'customer:delete', 'customer', '删除客户'),
('客户回访', 'customer:followup', 'customer', '记录客户回访'),
('商品列表', 'product:list', 'product', '查看商品列表'),
('创建商品', 'product:create', 'product', '创建商品'),
('编辑商品', 'product:edit', 'product', '编辑商品'),
('删除商品', 'product:delete', 'product', '删除商品'),
('库存管理', 'stock:manage', 'product', '管理库存'),
('订单列表', 'order:list', 'order', '查看订单列表'),
('创建订单', 'order:create', 'order', '创建订单'),
('审核订单', 'order:approve', 'order', '审核订单'),
('订单发货', 'order:ship', 'order', '订单发货'),
('订单退款', 'order:refund', 'order', '订单退款'),
('采购列表', 'procurement:list', 'procurement', '查看采购列表'),
('创建采购', 'procurement:create', 'procurement', '创建采购单'),
('审批采购', 'procurement:approve', 'procurement', '审批采购单'),
('采购收货', 'procurement:receive', 'procurement', '采购收货'),
('文档管理', 'knowledge:document', 'knowledge', '管理文档'),
('公告管理', 'knowledge:information', 'knowledge', '管理公告'),
('权限管理', 'permission:manage', 'permission', '管理权限'),
('角色管理', 'permission:role', 'permission', '管理角色'),
('系统设置', 'setting:manage', 'setting', '管理系统设置');

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
  `permission_id` BIGINT UNSIGNED NOT NULL COMMENT '权限ID',
  PRIMARY KEY (`role_id`, `permission_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11),
(1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 19), (1, 20), (1, 21),
(1, 22), (1, 23), (1, 24), (1, 25),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11),
(2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18), (2, 19), (2, 21), (2, 22), (2, 25),
(3, 1), (3, 2), (3, 6), (3, 7), (3, 11), (3, 12), (3, 15), (3, 17), (3, 18), (3, 20), (3, 21),
(4, 1), (4, 2), (4, 6), (4, 7), (4, 12), (4, 13), (4, 21), (4, 22);

CREATE TABLE IF NOT EXISTS `customers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '客户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '客户名称',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `company` VARCHAR(200) DEFAULT NULL COMMENT '公司名称',
  `address` VARCHAR(500) DEFAULT NULL COMMENT '地址',
  `source` VARCHAR(50) DEFAULT NULL COMMENT '客户来源',
  `status` ENUM('active', 'inactive', 'lost') NOT NULL DEFAULT 'active' COMMENT '状态',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_customers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

INSERT INTO `customers` (`name`, `email`, `phone`, `company`, `address`, `source`, `status`, `remark`, `created_by`) VALUES
('张三', 'zhangsan@example.com', '13812345678', '科技有限公司', '北京市朝阳区', '线上渠道', 'active', '重要客户', 1),
('李四', 'lisi@example.com', '13987654321', '贸易公司', '上海市浦东新区', '转介绍', 'active', '', 1),
('王五', 'wangwu@example.com', '13711112222', '制造企业', '广东省深圳市', '展会', 'active', '长期合作', 1),
('赵六', 'zhaoliu@example.com', '13633334444', '服务公司', '浙江省杭州市', '线上渠道', 'inactive', '', 2),
('孙七', 'sunqi@example.com', '13555556666', '零售企业', '江苏省苏州市', '电话营销', 'active', '', 2);

CREATE TABLE IF NOT EXISTS `customer_tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
  `color` VARCHAR(20) DEFAULT '#1E90FF' COMMENT '标签颜色',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户标签表';

INSERT INTO `customer_tags` (`name`, `color`) VALUES
('VIP客户', '#FF6347'),
('新客户', '#32CD32'),
('高潜力', '#FFD700'),
('长期合作', '#9370DB'),
('待跟进', '#FFA500');

CREATE TABLE IF NOT EXISTS `customer_tag_relations` (
  `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
  `tag_id` BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`customer_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `fk_customer_tag_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_customer_tag_tag` FOREIGN KEY (`tag_id`) REFERENCES `customer_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户标签关联表';

INSERT INTO `customer_tag_relations` (`customer_id`, `tag_id`) VALUES (1, 1), (1, 4), (2, 2), (3, 3), (3, 4), (5, 2);

CREATE TABLE IF NOT EXISTS `customer_followups` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '回访ID',
  `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '回访人ID',
  `followup_time` DATETIME NOT NULL COMMENT '回访时间',
  `content` TEXT NOT NULL COMMENT '回访内容',
  `result` ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending' COMMENT '回访结果',
  `next_followup_time` DATETIME DEFAULT NULL COMMENT '下次回访时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_followup_time` (`followup_time`),
  CONSTRAINT `fk_followups_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_followups_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户回访表';

INSERT INTO `customer_followups` (`customer_id`, `user_id`, `followup_time`, `content`, `result`, `next_followup_time`) VALUES
(1, 1, '2024-01-10 10:00:00', '沟通产品需求，客户意向明确', 'success', '2024-02-10 10:00:00'),
(2, 1, '2024-01-12 14:00:00', '介绍新产品，客户感兴趣', 'success', '2024-01-20 14:00:00'),
(3, 2, '2024-01-15 09:30:00', '跟进订单进度', 'pending', NULL),
(5, 2, '2024-01-14 16:00:00', '电话回访，客户暂无需求', 'failed', '2024-02-14 16:00:00');

CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父分类ID',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

INSERT INTO `product_categories` (`name`, `parent_id`, `sort_order`) VALUES
('电子产品', NULL, 1),
('配件', NULL, 2),
('外设', NULL, 3),
('耳机', 1, 1),
('数据线', 2, 1),
('键盘', 3, 1),
('鼠标', 3, 2),
('支架', 3, 3);

CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `sku` VARCHAR(100) NOT NULL COMMENT '商品编码',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
  `price` DECIMAL(10,2) NOT NULL COMMENT '售价',
  `cost_price` DECIMAL(10,2) NOT NULL COMMENT '成本价',
  `description` TEXT DEFAULT NULL COMMENT '商品描述',
  `images` JSON DEFAULT NULL COMMENT '商品图片',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_by` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sku` (`sku`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

INSERT INTO `products` (`name`, `sku`, `category_id`, `price`, `cost_price`, `description`, `images`, `status`, `created_by`) VALUES
('无线蓝牙耳机', 'P001', 4, 89.00, 50.00, '高品质无线蓝牙耳机，续航持久', '["/images/product1.jpg"]', 'active', 1),
('USB-C数据线', 'P002', 5, 15.00, 8.00, '1米快充数据线', '["/images/product2.jpg"]', 'active', 1),
('机械键盘', 'P003', 6, 299.00, 180.00, 'RGB背光机械键盘', '["/images/product3.jpg"]', 'active', 1),
('无线鼠标', 'P004', 7, 45.00, 25.00, '静音无线鼠标', '["/images/product4.jpg"]', 'active', 2),
('笔记本电脑支架', 'P005', 8, 68.00, 35.00, '可调节高度支架', '["/images/product5.jpg"]', 'active', 2);

CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '仓库ID',
  `name` VARCHAR(100) NOT NULL COMMENT '仓库名称',
  `address` VARCHAR(500) DEFAULT NULL COMMENT '仓库地址',
  `manager_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '管理员ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_manager_id` (`manager_id`),
  CONSTRAINT `fk_warehouses_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓库表';

INSERT INTO `warehouses` (`name`, `address`, `manager_id`, `status`) VALUES
('主仓库', '北京市朝阳区仓库路1号', 3, 1),
('分仓库', '上海市浦东新区仓储中心', NULL, 1);

CREATE TABLE IF NOT EXISTS `stock` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '库存ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `warehouse_id` BIGINT UNSIGNED NOT NULL COMMENT '仓库ID',
  `quantity` INT NOT NULL DEFAULT 0 COMMENT '库存数量',
  `locked_quantity` INT NOT NULL DEFAULT 0 COMMENT '锁定数量',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_warehouse` (`product_id`, `warehouse_id`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  CONSTRAINT `fk_stock_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';

INSERT INTO `stock` (`product_id`, `warehouse_id`, `quantity`, `locked_quantity`) VALUES
(1, 1, 500, 20),
(1, 2, 200, 0),
(2, 1, 1000, 50),
(3, 1, 100, 5),
(4, 1, 300, 0),
(5, 1, 150, 10);

CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(50) NOT NULL COMMENT '订单编号',
  `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
  `status` ENUM('pending', 'approved', 'paid', 'shipped', 'completed', 'cancelled', 'refund_pending', 'refunded', 'return_pending', 'returned') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `total_amount` DECIMAL(12,2) NOT NULL COMMENT '订单总额',
  `shipping_address` JSON NOT NULL COMMENT '收货地址',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `approved_at` DATETIME DEFAULT NULL COMMENT '审核时间',
  `approved_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '审核人ID',
  `shipped_at` DATETIME DEFAULT NULL COMMENT '发货时间',
  `shipped_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '发货人ID',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_shipped_by` FOREIGN KEY (`shipped_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

INSERT INTO `orders` (`order_no`, `customer_id`, `user_id`, `status`, `total_amount`, `shipping_address`, `remark`, `approved_at`, `approved_by`, `shipped_at`, `shipped_by`, `completed_at`) VALUES
('ORD20240115001', 1, 1, 'completed', 189.00, '{"name":"张三","phone":"13812345678","address":"北京市朝阳区"}', '', '2024-01-15 11:00:00', 1, '2024-01-15 14:00:00', 3, '2024-01-18 10:00:00'),
('ORD20240115002', 2, 2, 'shipped', 344.00, '{"name":"李四","phone":"13987654321","address":"上海市浦东新区"}', '加急', '2024-01-15 10:30:00', 1, '2024-01-15 15:00:00', 3, NULL),
('ORD20240115003', 3, 1, 'approved', 45.00, '{"name":"王五","phone":"13711112222","address":"广东省深圳市"}', '', '2024-01-15 09:00:00', 1, NULL, NULL, NULL),
('ORD20240115004', 5, 2, 'pending', 153.00, '{"name":"孙七","phone":"13555556666","address":"江苏省苏州市"}', '', NULL, NULL, NULL, NULL, NULL),
('ORD20240114001', 1, 1, 'refunded', 89.00, '{"name":"张三","phone":"13812345678","address":"北京市朝阳区"}', '客户申请退款', '2024-01-14 10:00:00', 1, '2024-01-14 12:00:00', 3, NULL);

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单明细ID',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `subtotal` DECIMAL(12,2) NOT NULL COMMENT '小计',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `price`, `subtotal`) VALUES
(1, 1, 2, 89.00, 178.00),
(1, 2, 1, 11.00, 11.00),
(2, 3, 1, 299.00, 299.00),
(2, 4, 1, 45.00, 45.00),
(3, 4, 1, 45.00, 45.00),
(4, 1, 1, 89.00, 89.00),
(4, 5, 1, 64.00, 64.00),
(5, 1, 1, 89.00, 89.00);

CREATE TABLE IF NOT EXISTS `order_status_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `status` VARCHAR(50) NOT NULL COMMENT '状态',
  `operator_id` BIGINT UNSIGNED NOT NULL COMMENT '操作人ID',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_operator_id` (`operator_id`),
  CONSTRAINT `fk_order_logs_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_logs_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单状态日志表';

INSERT INTO `order_status_logs` (`order_id`, `status`, `operator_id`, `remark`) VALUES
(1, 'pending', 1, '订单创建'),
(1, 'approved', 1, '审核通过'),
(1, 'paid', 1, '支付完成'),
(1, 'shipped', 3, '已发货'),
(1, 'completed', 3, '订单完成'),
(2, 'pending', 2, '订单创建'),
(2, 'approved', 1, '审核通过'),
(2, 'paid', 2, '支付完成'),
(2, 'shipped', 3, '已发货');

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '供应商ID',
  `name` VARCHAR(200) NOT NULL COMMENT '供应商名称',
  `contact` VARCHAR(100) DEFAULT NULL COMMENT '联系人',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `address` VARCHAR(500) DEFAULT NULL COMMENT '地址',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='供应商表';

INSERT INTO `suppliers` (`name`, `contact`, `phone`, `email`, `address`, `status`) VALUES
('深圳电子科技有限公司', '陈经理', '0755-12345678', 'contact@szelectronics.com', '广东省深圳市南山区', 1),
('东莞线缆厂', '李厂长', '0769-87654321', 'li@dongguancable.com', '广东省东莞市', 1),
('宁波五金制品有限公司', '张总', '0574-22334455', 'zhang@ningbohardware.com', '浙江省宁波市', 1),
('常州电子厂', '王经理', '0519-66778899', 'wang@changzhouelec.com', '江苏省常州市', 1);

CREATE TABLE IF NOT EXISTS `procurements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '采购单ID',
  `procurement_no` VARCHAR(50) NOT NULL COMMENT '采购单编号',
  `supplier_id` BIGINT UNSIGNED NOT NULL COMMENT '供应商ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
  `status` ENUM('pending', 'approved', 'ordered', 'received', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '采购状态',
  `total_amount` DECIMAL(12,2) NOT NULL COMMENT '采购总额',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `approved_at` DATETIME DEFAULT NULL COMMENT '审批时间',
  `approved_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '审批人ID',
  `ordered_at` DATETIME DEFAULT NULL COMMENT '下单时间',
  `received_at` DATETIME DEFAULT NULL COMMENT '收货时间',
  `received_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '收货人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_procurement_no` (`procurement_no`),
  KEY `idx_supplier_id` (`supplier_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_procurements_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_procurements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_procurements_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_procurements_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采购单表';

INSERT INTO `procurements` (`procurement_no`, `supplier_id`, `user_id`, `status`, `total_amount`, `remark`, `approved_at`, `approved_by`, `ordered_at`, `received_at`, `received_by`) VALUES
('PR20240115001', 1, 3, 'pending', 4450.00, '采购蓝牙耳机50个', NULL, NULL, NULL, NULL, NULL),
('PR20240114001', 2, 3, 'approved', 1500.00, '采购数据线100条', '2024-01-14 10:00:00', 1, NULL, NULL, NULL),
('PR20240113001', 3, 3, 'ordered', 2040.00, '采购支架30个', '2024-01-13 09:00:00', 1, '2024-01-13 11:00:00', NULL, NULL),
('PR20240112001', 4, 3, 'received', 5980.00, '采购键盘20个', '2024-01-12 08:00:00', 1, '2024-01-12 10:00:00', '2024-01-14 14:00:00', 3);

CREATE TABLE IF NOT EXISTS `procurement_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '采购明细ID',
  `procurement_id` BIGINT UNSIGNED NOT NULL COMMENT '采购单ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `subtotal` DECIMAL(12,2) NOT NULL COMMENT '小计',
  PRIMARY KEY (`id`),
  KEY `idx_procurement_id` (`procurement_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_procurement_items_procurement` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_procurement_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采购明细表';

INSERT INTO `procurement_items` (`procurement_id`, `product_id`, `quantity`, `price`, `subtotal`) VALUES
(1, 1, 50, 89.00, 4450.00),
(2, 2, 100, 15.00, 1500.00),
(3, 5, 30, 68.00, 2040.00),
(4, 3, 20, 299.00, 5980.00);

CREATE TABLE IF NOT EXISTS `document_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父分类ID',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_doc_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `document_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档分类表';

INSERT INTO `document_categories` (`name`, `parent_id`, `sort_order`) VALUES
('产品文档', NULL, 1),
('操作指南', NULL, 2),
('常见问题', NULL, 3),
('产品介绍', 1, 1),
('技术规格', 1, 2),
('使用手册', 2, 1),
('故障排除', 3, 1);

CREATE TABLE IF NOT EXISTS `documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文档ID',
  `title` VARCHAR(200) NOT NULL COMMENT '文档标题',
  `content` LONGTEXT NOT NULL COMMENT '文档内容',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft' COMMENT '状态',
  `views` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_documents_category` FOREIGN KEY (`category_id`) REFERENCES `document_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_documents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档表';

INSERT INTO `documents` (`title`, `content`, `category_id`, `user_id`, `status`, `views`) VALUES
('产品使用手册', '# 产品使用手册\n\n欢迎使用我们的产品...', 6, 1, 'published', 120),
('常见问题解答', '# 常见问题\n\nQ: 如何重置密码？\nA: ...', 7, 2, 'published', 85),
('技术规格说明', '# 技术规格\n\n本产品技术参数如下...', 5, 1, 'draft', 15);

CREATE TABLE IF NOT EXISTS `information_posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` VARCHAR(200) NOT NULL COMMENT '公告标题',
  `content` LONGTEXT NOT NULL COMMENT '公告内容',
  `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '发布人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_is_top` (`is_top`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_information_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='信息公告表';

INSERT INTO `information_posts` (`title`, `content`, `is_top`, `user_id`) VALUES
('系统升级通知', '尊敬的用户，系统将于今晚22:00进行升级维护...', 1, 1),
('新功能上线', '新增采购管理模块，欢迎使用！', 0, 1),
('春节放假通知', '春节放假时间：2月10日-2月17日...', 0, 2);

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '设置ID',
  `key` VARCHAR(100) NOT NULL COMMENT '设置键',
  `value` TEXT NOT NULL COMMENT '设置值',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '设置描述',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表';

INSERT INTO `system_settings` (`key`, `value`, `description`) VALUES
('site_name', 'CRM系统', '系统名称'),
('notification_email', 'true', '邮件通知'),
('notification_sms', 'false', '短信通知'),
('language', 'zh-CN', '系统语言'),
('theme', 'light', '系统主题'),
('timezone', 'Asia/Shanghai', '时区');

CREATE TABLE IF NOT EXISTS `operation_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '操作人ID',
  `action` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `module` VARCHAR(50) NOT NULL COMMENT '操作模块',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '操作描述',
  `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_operation_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';