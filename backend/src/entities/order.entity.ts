import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type OrderStatus = 'pending' | 'approved' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refund_pending' | 'refunded' | 'return_pending' | 'returned';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 50, unique: true })
  order_no: string;

  @Column({ type: 'bigint', unsigned: true })
  customer_id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'paid', 'shipped', 'completed', 'cancelled', 'refund_pending', 'refunded', 'return_pending', 'returned'], default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'json' })
  shipping_address: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'datetime', nullable: true })
  approved_at: Date;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  approved_by: number;

  @Column({ type: 'datetime', nullable: true })
  shipped_at: Date;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  shipped_by: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shipping_company: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tracking_number: string;

  @Column({ type: 'json', nullable: true })
  tracking_history: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  items: Record<string, any>[];

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}