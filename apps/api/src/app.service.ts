import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ForwardersModule } from './forwarders/forwarders.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    SuppliersModule,
    ForwardersModule,
    OrdersModule,
    InvoicesModule,
  ],
})
export class AppModule {}
