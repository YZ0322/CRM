import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';

interface CreateProductDto {
  name: string;
  sku: string;
  category_id: number;
  price: number;
  cost_price: number;
  description?: string;
  images?: string[];
  status?: ProductStatus;
  created_by: number;
}

interface UpdateProductDto {
  name?: string;
  sku?: string;
  category_id?: number;
  price?: number;
  cost_price?: number;
  description?: string;
  images?: string[];
  status?: ProductStatus;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(page: number = 1, pageSize: number = 10, search?: string, status?: ProductStatus) {
    const query = this.productRepository.createQueryBuilder('product');

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (search) {
      conditions.push('product.name LIKE :search OR product.sku LIKE :search');
      params.search = `%${search}%`;
    }

    if (status) {
      conditions.push('product.status = :status');
      params.status = status;
    }

    if (conditions.length > 0) {
      query.where(conditions.join(' AND '), params);
    }

    query.orderBy('product.created_at', 'DESC');

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
    return this.productRepository.findOne({ where: { id } });
  }

  async create(dto: CreateProductDto) {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.productRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.productRepository.delete(id);
    return { id };
  }

  async getStats() {
    const totalProducts = await this.productRepository.count();
    const activeCount = await this.productRepository.count({ where: { status: 'active' } });
    const inactiveCount = await this.productRepository.count({ where: { status: 'inactive' } });

    return {
      totalProducts,
      activeCount,
      inactiveCount,
    };
  }
}