import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, CustomerStatus } from '../entities/customer.entity';

interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  source?: string;
  status?: CustomerStatus;
  remark?: string;
  created_by: number;
}

interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  source?: string;
  status?: CustomerStatus;
  remark?: string;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async findAll(page: number = 1, pageSize: number = 10, search?: string, status?: CustomerStatus, source?: string) {
    const query = this.customerRepository.createQueryBuilder('customer');

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (search) {
      conditions.push('customer.name LIKE :search OR customer.company LIKE :search OR customer.phone LIKE :search');
      params.search = `%${search}%`;
    }

    if (status) {
      conditions.push('customer.status = :status');
      params.status = status;
    }

    if (source) {
      conditions.push('customer.source = :source');
      params.source = source;
    }

    if (conditions.length > 0) {
      query.where(conditions.join(' AND '), params);
    }

    query.orderBy('customer.created_at', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    return this.customerRepository.findOne({ where: { id } });
  }

  async create(dto: CreateCustomerDto) {
    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.customerRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.customerRepository.delete(id);
    return { id };
  }

  async getStats() {
    const totalCustomers = await this.customerRepository.count();
    const activeCount = await this.customerRepository.count({ where: { status: 'active' } });
    const inactiveCount = await this.customerRepository.count({ where: { status: 'inactive' } });
    const lostCount = await this.customerRepository.count({ where: { status: 'lost' } });

    return {
      totalCustomers,
      activeCount,
      inactiveCount,
      lostCount,
    };
  }
}