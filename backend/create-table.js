require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS operation_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NULL,
      username VARCHAR(50) NULL,
      operation ENUM('create', 'update', 'delete', 'read', 'login', 'logout', 'approve', 'reject', 'ship', 'backup') NOT NULL,
      module VARCHAR(100) NOT NULL,
      description VARCHAR(255) NOT NULL,
      params TEXT NULL,
      result TEXT NULL,
      ip VARCHAR(50) NULL,
      user_agent VARCHAR(255) NULL,
      status TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_operation (operation),
      INDEX idx_module (module),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('Table operation_logs created successfully');
  await conn.end();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});