import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOperationLogs1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE operation_logs (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE operation_logs`);
    }
}