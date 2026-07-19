import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type AnnouncementType = 'warning' | 'info' | 'danger' | 'success';

export type AnnouncementStatus = 'draft' | 'published';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['warning', 'info', 'danger', 'success'], default: 'info' })
  type: AnnouncementType;

  @Column({ type: 'enum', enum: ['draft', 'published'], default: 'draft' })
  status: AnnouncementStatus;

  @Column({ type: 'bigint', unsigned: true })
  created_by: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  updated_by: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}