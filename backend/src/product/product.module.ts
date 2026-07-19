import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { StockService } from './stock.service';
import { ProductController } from './product.controller';
import { StockController } from './stock.controller';
import { Product } from '../entities/product.entity';
import { Stock } from '../entities/stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Stock])],
  controllers: [ProductController, StockController],
  providers: [ProductService, StockService],
})
export class ProductModule {}