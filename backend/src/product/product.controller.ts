import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Product } from '../entities/product.entity';
import type { ProductStatus } from '../entities/product.entity';

@ApiTags('商品管理')
@Controller('api/products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: ProductStatus,
  ) {
    return this.productService.findAll(page, pageSize, search, status);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取商品统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    return this.productService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() body: { name: string; sku: string; category_id: number; price: number; cost_price: number; description?: string; images?: string[]; status?: ProductStatus; created_by: number }) {
    return this.productService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商品' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() body: { name?: string; sku?: string; category_id?: number; price?: number; cost_price?: number; description?: string; images?: string[]; status?: ProductStatus }) {
    return this.productService.update(Number(id), body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }
}