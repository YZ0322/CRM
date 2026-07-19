import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { BackupModule } from './backup/backup.module';
import { OperationLogModule } from './operation_log/operation_log.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    CustomerModule,
    OrderModule,
    ProductModule,
    AnnouncementModule,
    BackupModule,
    OperationLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}