import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { FollowupService } from './followup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Customer } from '../entities/customer.entity';
import type { CustomerStatus } from '../entities/customer.entity';
import type { FollowupResult } from '../entities/customer_followup.entity';

@ApiTags('客户管理')
@Controller('api/customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private followupService: FollowupService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取客户列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: CustomerStatus,
    @Query('source') source?: string,
  ) {
    return this.customerService.findAll(page, pageSize, search, status, source);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取客户统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    return this.customerService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取客户详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '客户不存在' })
  async findOne(@Param('id') id: string) {
    const customer = await this.customerService.findOne(Number(id));
    if (!customer) {
      return { code: 404, message: '客户不存在', data: null };
    }
    const followups = await this.followupService.findByCustomer(Number(id));
    return { ...customer, followups };
  }

  @Post()
  @ApiOperation({ summary: '创建客户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() body: { name: string; email?: string; phone?: string; company?: string; address?: string; source?: string; status?: CustomerStatus; remark?: string; created_by: number }) {
    return this.customerService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() body: { name?: string; email?: string; phone?: string; company?: string; address?: string; source?: string; status?: CustomerStatus; remark?: string }) {
    return this.customerService.update(Number(id), body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    return this.customerService.remove(Number(id));
  }

  @Get(':id/followups')
  @ApiOperation({ summary: '获取客户回访记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFollowups(@Param('id') id: string) {
    return this.followupService.findByCustomer(Number(id));
  }

  @Post(':id/followups')
  @ApiOperation({ summary: '新建回访记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createFollowup(@Param('id') id: string, @Body() body: { user_id: number; followup_time: Date; content: string; result?: FollowupResult; next_followup_time?: Date }) {
    return this.followupService.create({ ...body, customer_id: Number(id) });
  }

  @Put('followups/:followupId')
  @ApiOperation({ summary: '更新回访记录' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateFollowup(@Param('followupId') followupId: string, @Body() body: { followup_time?: Date; content?: string; result?: FollowupResult; next_followup_time?: Date }) {
    return this.followupService.update(Number(followupId), body);
  }

  @Delete('followups/:followupId')
  @ApiOperation({ summary: '删除回访记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteFollowup(@Param('followupId') followupId: string) {
    return this.followupService.remove(Number(followupId));
  }
}