import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type FollowupResult = 'pending' | 'success' | 'failed';

@Entity('customer_followups')
export class CustomerFollowup {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  customer_id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'datetime' })
  followup_time: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['pending', 'success', 'failed'], default: 'pending' })
  result: FollowupResult;

  @Column({ type: 'datetime', nullable: true })
  next_followup_time: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}