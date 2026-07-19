import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnnouncementService } from './announcement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AnnouncementType, AnnouncementStatus } from '../entities/announcement.entity';

@ApiTags('公告管理')
@Controller('api/announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementController {
  constructor(private announcementService: AnnouncementService) {}

  @Get()
  @ApiOperation({ summary: '获取公告列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query('status') status?: AnnouncementStatus) {
    return this.announcementService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取公告详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '公告不存在' })
  async findOne(@Param('id') id: string) {
    const announcement = await this.announcementService.findOne(Number(id));
    if (!announcement) {
      return { code: 404, message: '公告不存在', data: null };
    }
    return announcement;
  }

  @Post()
  @ApiOperation({ summary: '创建公告' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() body: { title: string; content: string; type?: AnnouncementType; status?: AnnouncementStatus; created_by: number }) {
    return this.announcementService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新公告' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() body: { title?: string; content?: string; type?: AnnouncementType; status?: AnnouncementStatus; updated_by?: number }) {
    return this.announcementService.update(Number(id), body);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: '发布公告' })
  @ApiResponse({ status: 200, description: '发布成功' })
  async publish(@Param('id') id: string, @Body() body: { user_id: number }) {
    return this.announcementService.publish(Number(id), body.user_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除公告' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    return this.announcementService.remove(Number(id));
  }
}