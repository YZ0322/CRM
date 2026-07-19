import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../entities/stock.entity';

interface UpdateStockDto {
  quantity?: number;
  locked_quantity?: number;
}

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async findByProduct(productId: number) {
    return this.stockRepository.find({
      where: { product_id: productId },
    });
  }

  async findAll(page: number = 1, pageSize: number = 10, productId?: number) {
    const query = this.stockRepository.createQueryBuilder('stock');

    if (productId) {
      query.where('stock.product_id = :productId', { productId });
    }

    query.orderBy('stock.product_id', 'ASC');

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
    return this.stockRepository.findOne({ where: { id } });
  }

  async create(productId: number, warehouseId: number, quantity: number, lockedQuantity: number = 0) {
    const stock = this.stockRepository.create({
      product_id: productId,
      warehouse_id: warehouseId,
      quantity,
      locked_quantity: lockedQuantity,
    });
    return this.stockRepository.save(stock);
  }

  async update(id: number, dto: UpdateStockDto) {
    await this.stockRepository.update(id, dto);
    return this.findOne(id);
  }

  async adjustStock(productId: number, delta: number) {
    const stocks = await this.findByProduct(productId);
    if (stocks.length === 0) return null;

    const mainStock = stocks[0];
    await this.stockRepository.update(mainStock.id, {
      quantity: Math.max(0, mainStock.quantity + delta),
    });
    return this.findOne(mainStock.id);
  }
}