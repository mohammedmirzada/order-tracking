import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateForwarderDto } from './dto/create-forwarder.dto';
import { UpdateForwarderDto } from './dto/update-forwarder.dto';

@Injectable()
export class ForwardersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};
    
    const [data, total] = await Promise.all([
      this.prisma.forwarder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.forwarder.count({ where }),
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
    const forwarder = await this.prisma.forwarder.findUnique({ where: { id } });
    if (!forwarder) throw new NotFoundException('Forwarder not found');
    return forwarder;
  }

  async create(dto: CreateForwarderDto) {
    try {
      return await this.prisma.forwarder.create({ data: dto });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A forwarder with this name already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateForwarderDto) {
    try {
      return await this.prisma.forwarder.update({ where: { id }, data: dto });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A forwarder with this name already exists');
      }
      throw error;
    }
  }

  remove(id: string) {
    return this.prisma.forwarder.delete({ where: { id } });
  }
}