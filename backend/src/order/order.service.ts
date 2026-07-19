import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';

interface CreateOrderDto {
  customer_id: number;
  user_id: number;
  total_amount: number;
  shipping_address: Record<string, string>;
  remark?: string;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async findAll(page: number = 1, pageSize: number = 10, status?: OrderStatus, search?: string) {
    const query = this.orderRepository.createQueryBuilder('o')
      .leftJoin('customers', 'c', 'c.id = o.customer_id')
      .select(['o.*', 'c.name as customer_name']);

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (status) {
      conditions.push('o.status = :status');
      params.status = status;
    }

    if (search) {
      conditions.push('o.order_no LIKE :search OR c.name LIKE :search');
      params.search = `%${search}%`;
    }

    if (conditions.length > 0) {
      query.where(conditions.join(' AND '), params);
    }

    const total = await query.getCount();

    query.orderBy('o.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const data = await query.getRawMany();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    return this.orderRepository.createQueryBuilder('o')
      .leftJoin('customers', 'c', 'c.id = o.customer_id')
      .select(['o.*', 'c.name as customer_name'])
      .where('o.id = :id', { id })
      .getRawOne();
  }

  async create(dto: CreateOrderDto) {
    const orderNo = `ORD${Date.now().toString().slice(-10)}`;
    const order = this.orderRepository.create({
      ...dto,
      order_no: orderNo,
      status: 'pending',
    });
    return this.orderRepository.save(order);
  }

  async approve(id: number, userId: number) {
    const order = await this.findOne(id);
    if (!order) return null;
    if (order.status !== 'pending') return null;

    await this.orderRepository.update(id, {
      status: 'approved' as OrderStatus,
      approved_at: new Date(),
      approved_by: userId,
    });
    return this.findOne(id);
  }

  async reject(id: number) {
    const order = await this.findOne(id);
    if (!order) return null;
    if (order.status !== 'pending') return null;

    await this.orderRepository.update(id, {
      status: 'cancelled' as OrderStatus,
    });
    return this.findOne(id);
  }

  async ship(id: number, userId: number, shippingCompany?: string, trackingNumber?: string) {
    const order = await this.findOne(id);
    if (!order) return null;
    if (order.status !== 'approved' && order.status !== 'paid') return null;

    const updateData: Record<string, any> = {
      status: 'shipped' as OrderStatus,
      shipped_at: new Date(),
      shipped_by: userId,
    };

    if (shippingCompany) updateData.shipping_company = shippingCompany;
    if (trackingNumber) updateData.tracking_number = trackingNumber;

    await this.orderRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateTracking(id: number, trackingNumber: string, shippingCompany: string, history?: Record<string, any>[]) {
    const order = await this.findOne(id);
    if (!order) return null;

    await this.orderRepository.update(id, {
      tracking_number: trackingNumber,
      shipping_company: shippingCompany,
      tracking_history: history,
    });
    return this.findOne(id);
  }

  async complete(id: number) {
    const order = await this.findOne(id);
    if (!order) return null;
    if (order.status !== 'shipped') return null;

    await this.orderRepository.update(id, {
      status: 'completed' as OrderStatus,
      completed_at: new Date(),
    });
    return this.findOne(id);
  }

  async requestRefund(id: number) {
    const order = await this.findOne(id);
    if (!order) return null;
    if (order.status !== 'shipped' && order.status !== 'completed') return null;

    await this.orderRepository.update(id, {
      status: 'refund_pending' as OrderStatus,
    });
    return this.findOne(id);
  }

  async processRefund(id: number) {
    const order = await this.findOne(id);
    if (!order) return null;
    if (order.status !== 'refund_pending') return null;

    await this.orderRepository.update(id, {
      status: 'refunded' as OrderStatus,
    });
    return this.findOne(id);
  }

  async requestReturn(id: number) {
    const order = await this.findOne(id);
    if (!order) return null;
    if (order.status !== 'shipped') return null;

    await this.orderRepository.update(id, {
      status: 'return_pending' as OrderStatus,
    });
    return this.findOne(id);
  }

  async confirmReturn(id: number) {
    const order = await this.findOne(id);
    if (!order) return null;
    if (order.status !== 'return_pending') return null;

    await this.orderRepository.update(id, {
      status: 'returned' as OrderStatus,
    });
    return this.findOne(id);
  }

  async cancel(id: number) {
    const order = await this.findOne(id);
    if (!order) return null;

    await this.orderRepository.update(id, {
      status: 'cancelled' as OrderStatus,
    });
    return this.findOne(id);
  }

  async getStats() {
    const totalOrders = await this.orderRepository.count();
    const totalAmount = await this.orderRepository.sum('total_amount');
    const pendingCount = await this.orderRepository.count({ where: { status: 'pending' } });
    const approvedCount = await this.orderRepository.count({ where: { status: 'approved' } });
    const shippedCount = await this.orderRepository.count({ where: { status: 'shipped' } });
    const completedCount = await this.orderRepository.count({ where: { status: 'completed' } });
    const refundPendingCount = await this.orderRepository.count({ where: { status: 'refund_pending' } });

    return {
      totalOrders,
      totalAmount: totalAmount || 0,
      pendingCount,
      approvedCount,
      shippedCount,
      completedCount,
      refundPendingCount,
    };
  }

  async getRecentOrders(limit: number = 5) {
    return this.orderRepository.createQueryBuilder('o')
      .leftJoin('customers', 'c', 'c.id = o.customer_id')
      .select(['o.*', 'c.name as customer_name'])
      .orderBy('o.created_at', 'DESC')
      .take(limit)
      .getRawMany();
  }
}