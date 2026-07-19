import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type OperationType = 'create' | 'update' | 'delete' | 'read' | 'login' | 'logout' | 'approve' | 'reject' | 'ship' | 'backup';

@Entity('operation_logs')
export class OperationLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  user_id: number;

  @Column({ length: 50, nullable: true })
  username: string;

  @Column({ type: 'enum', enum: ['create', 'update', 'delete', 'read', 'login', 'logout', 'approve', 'reject', 'ship', 'backup'] })
  operation: OperationType;

  @Column({ length: 100 })
  module: string;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'text', nullable: true })
  params: string;

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ length: 50, nullable: true })
  ip: string;

  @Column({ length: 255, nullable: true })
  user_agent: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}