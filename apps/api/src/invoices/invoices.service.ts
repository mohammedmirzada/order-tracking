import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        orderId: dto.orderId,
        invoiceNumber: dto.invoiceNumber,
        invoiceDate: new Date(dto.invoiceDate),
      },
    });
  }

  remove(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }
}