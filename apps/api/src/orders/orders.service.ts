import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      include: { supplier: true, forwarder: true, items: true, invoices: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { supplier: true, forwarder: true, items: true, invoices: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          refNumber: dto.refNumber,
          supplierId: dto.supplierId,
          forwarderId: dto.forwarderId,
          status: dto.status as any,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          dispatchDate: dto.dispatchDate ? new Date(dto.dispatchDate) : undefined,
          estimatedDeliveryDate: dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : undefined,
          actualDeliveryDate: dto.actualDeliveryDate ? new Date(dto.actualDeliveryDate) : undefined,
          shipmentName: dto.shipmentName,
          comments: dto.comments,
        },
      });

      if (dto.items?.length) {
        await tx.orderItem.createMany({
          data: dto.items.map((i) => ({
            orderId: order.id,
            sku: i.sku,
            itemName: i.itemName,
            quantity: i.quantity,
            price: i.price as any,
            total: i.total as any,
          })),
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: { supplier: true, forwarder: true, items: true, invoices: true },
      });
    });
  }

  update(id: string, dto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data: {
        supplierId: dto.supplierId,
        forwarderId: dto.forwarderId,
        status: dto.status as any,
        orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
        dispatchDate: dto.dispatchDate ? new Date(dto.dispatchDate) : undefined,
        estimatedDeliveryDate: dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : undefined,
        actualDeliveryDate: dto.actualDeliveryDate ? new Date(dto.actualDeliveryDate) : undefined,
        shipmentName: dto.shipmentName,
        comments: dto.comments,
      },
    });
  }

  remove(id: string) {
    // cascades delete items/invoices if you set onDelete: Cascade
    return this.prisma.order.delete({ where: { id } });
  }
}