import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement, AnnouncementType, AnnouncementStatus } from '../entities/announcement.entity';

interface CreateAnnouncementDto {
  title: string;
  content: string;
  type?: AnnouncementType;
  status?: AnnouncementStatus;
  created_by: number;
}

interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  status?: AnnouncementStatus;
  updated_by?: number;
}

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
  ) {}

  async findAll(status?: AnnouncementStatus) {
    const query: Record<string, any> = {};
    if (status) query.status = status;
    return this.announcementRepository.find({
      where: query,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.announcementRepository.findOne({ where: { id } });
  }

  async create(dto: CreateAnnouncementDto) {
    const announcement = this.announcementRepository.create(dto);
    return this.announcementRepository.save(announcement);
  }

  async update(id: number, dto: UpdateAnnouncementDto) {
    await this.announcementRepository.update(id, dto);
    return this.findOne(id);
  }

  async publish(id: number, userId: number) {
    await this.announcementRepository.update(id, { status: 'published' as AnnouncementStatus, updated_by: userId });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.announcementRepository.delete(id);
    return { id };
  }
}