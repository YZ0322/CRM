import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Order } from '../entities/order.entity';
import type { OrderStatus } from '../entities/order.entity';

@ApiTags('订单管理')
@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
  ) {
    return this.orderService.findAll(page, pageSize, status, search);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取订单统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    return this.orderService.getStats();
  }

  @Get('recent')
  @ApiOperation({ summary: '获取最近订单' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecentOrders(@Query('limit') limit: number = 5) {
    return this.orderService.getRecentOrders(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() body: { customer_id: number; user_id: number; total_amount: number; shipping_address: Record<string, string>; remark?: string }) {
    return this.orderService.create(body);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: '审核订单' })
  @ApiResponse({ status: 200, description: '审核成功' })
  async approve(@Param('id') id: string, @Body() body: { user_id: number }) {
    return this.orderService.approve(Number(id), body.user_id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: '拒绝订单' })
  @ApiResponse({ status: 200, description: '拒绝成功' })
  async reject(@Param('id') id: string) {
    return this.orderService.reject(Number(id));
  }

  @Put(':id/ship')
  @ApiOperation({ summary: '发货' })
  @ApiResponse({ status: 200, description: '发货成功' })
  async ship(@Param('id') id: string, @Body() body: { user_id: number; shipping_company?: string; tracking_number?: string }) {
    return this.orderService.ship(Number(id), body.user_id, body.shipping_company, body.tracking_number);
  }

  @Put(':id/tracking')
  @ApiOperation({ summary: '更新物流信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateTracking(@Param('id') id: string, @Body() body: { tracking_number: string; shipping_company: string; history?: Record<string, any>[] }) {
    return this.orderService.updateTracking(Number(id), body.tracking_number, body.shipping_company, body.history);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: '完成订单' })
  @ApiResponse({ status: 200, description: '完成成功' })
  async complete(@Param('id') id: string) {
    return this.orderService.complete(Number(id));
  }

  @Put(':id/refund')
  @ApiOperation({ summary: '处理退款' })
  @ApiResponse({ status: 200, description: '退款成功' })
  async processRefund(@Param('id') id: string) {
    return this.orderService.processRefund(Number(id));
  }

  @Put(':id/return')
  @ApiOperation({ summary: '确认退货' })
  @ApiResponse({ status: 200, description: '确认成功' })
  async confirmReturn(@Param('id') id: string) {
    return this.orderService.confirmReturn(Number(id));
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancel(@Param('id') id: string) {
    return this.orderService.cancel(Number(id));
  }
}