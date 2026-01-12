import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search
      ? {
          invoiceNumber: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};
    
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              refNumber: true,
            },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            refNumber: true,
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    try {
      return await this.prisma.invoice.create({
        data: {
          orderId: dto.orderId,
          invoiceNumber: dto.invoiceNumber,
          invoiceDate: new Date(dto.invoiceDate),
        },
        include: {
          order: {
            select: {
              refNumber: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('An invoice with this number already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    try {
      return await this.prisma.invoice.update({
        where: { id },
        data: {
          ...(dto.invoiceNumber && { invoiceNumber: dto.invoiceNumber }),
          ...(dto.invoiceDate && { invoiceDate: new Date(dto.invoiceDate) }),
        },
        include: {
          order: {
            select: {
              refNumber: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('An invoice with this number already exists');
      }
      throw error;
    }
  }

  remove(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }
}