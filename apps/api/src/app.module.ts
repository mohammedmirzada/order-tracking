import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { ForwardersModule } from './forwarders/forwarders.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { InvoicesModule } from './invoices/invoices.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    SuppliersModule,
    ForwardersModule,
    OrdersModule,
    InvoicesModule,
    HealthModule,
  ]
})
export class AppModule {}