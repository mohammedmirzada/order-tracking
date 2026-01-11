import { Module } from '@nestjs/common';
import { ForwardersController } from './forwarders.controller';
import { ForwardersService } from './forwarders.service';

@Module({ controllers: [ForwardersController], providers: [ForwardersService] })
export class ForwardersModule {}