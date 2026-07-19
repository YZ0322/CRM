import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('库存管理')
@Controller('api/stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private stockService: StockService) {}

  @Get()
  @ApiOperation({ summary: '获取库存列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('productId') productId?: number,
  ) {
    return this.stockService.findAll(page, pageSize, productId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取库存详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    return this.stockService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: '创建库存记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() body: { product_id: number; warehouse_id: number; quantity: number; locked_quantity?: number }) {
    return this.stockService.create(body.product_id, body.warehouse_id, body.quantity, body.locked_quantity || 0);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新库存' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() body: { quantity?: number; locked_quantity?: number }) {
    return this.stockService.update(Number(id), body);
  }

  @Put('product/:productId/adjust')
  @ApiOperation({ summary: '调整库存' })
  @ApiResponse({ status: 200, description: '调整成功' })
  async adjustStock(@Param('productId') productId: string, @Body() body: { delta: number }) {
    return this.stockService.adjustStock(Number(productId), body.delta);
  }
}