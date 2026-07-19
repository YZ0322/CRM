import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type CustomerStatus = 'active' | 'inactive' | 'lost';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 200, nullable: true })
  company: string;

  @Column({ length: 50, nullable: true })
  wechat: string;

  @Column({ length: 10, nullable: true })
  phone_code: string;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  province: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  district: string;

  @Column({ length: 200, nullable: true })
  street: string;

  @Column({ length: 50, nullable: true })
  source: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'lost'], default: 'active' })
  status: CustomerStatus;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'bigint', unsigned: true })
  created_by: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}