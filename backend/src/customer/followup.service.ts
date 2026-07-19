import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerFollowup, FollowupResult } from '../entities/customer_followup.entity';

interface CreateFollowupDto {
  customer_id: number;
  user_id: number;
  followup_time: Date;
  content: string;
  result?: FollowupResult;
  next_followup_time?: Date;
}

interface UpdateFollowupDto {
  followup_time?: Date;
  content?: string;
  result?: FollowupResult;
  next_followup_time?: Date;
}

@Injectable()
export class FollowupService {
  constructor(
    @InjectRepository(CustomerFollowup)
    private followupRepository: Repository<CustomerFollowup>,
  ) {}

  async findByCustomer(customerId: number) {
    return this.followupRepository.find({
      where: { customer_id: customerId },
      order: { followup_time: 'DESC' },
    });
  }

  async create(dto: CreateFollowupDto) {
    const followup = this.followupRepository.create(dto);
    return this.followupRepository.save(followup);
  }

  async update(id: number, dto: UpdateFollowupDto) {
    await this.followupRepository.update(id, dto);
    return this.findOne(id);
  }

  async findOne(id: number) {
    return this.followupRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.followupRepository.delete(id);
    return { id };
  }
}