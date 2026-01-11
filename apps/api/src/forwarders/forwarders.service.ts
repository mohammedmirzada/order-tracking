import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateForwarderDto } from './dto/create-forwarder.dto';
import { UpdateForwarderDto } from './dto/update-forwarder.dto';

@Injectable()
export class ForwardersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.forwarder.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const forwarder = await this.prisma.forwarder.findUnique({ where: { id } });
    if (!forwarder) throw new NotFoundException('Forwarder not found');
    return forwarder;
  }

  create(dto: CreateForwarderDto) {
    return this.prisma.forwarder.create({ data: dto });
  }

  update(id: string, dto: UpdateForwarderDto) {
    return this.prisma.forwarder.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.forwarder.delete({ where: { id } });
  }
}