import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { ForwardersModule } from './forwarders/forwarders.module';
import { SuppliersModule } from './suppliers/suppliers.module';

@Module({
  imports: [OrdersModule, AuthModule, ForwardersModule, SuppliersModule],
})
export class AppModule {}