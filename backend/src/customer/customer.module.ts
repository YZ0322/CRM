import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { FollowupService } from './followup.service';
import { CustomerController } from './customer.controller';
import { Customer } from '../entities/customer.entity';
import { CustomerFollowup } from '../entities/customer_followup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, CustomerFollowup])],
  controllers: [CustomerController],
  providers: [CustomerService, FollowupService],
})
export class CustomerModule {}