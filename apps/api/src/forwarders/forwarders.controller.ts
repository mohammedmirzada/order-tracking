import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ForwardersService } from './forwarders.service';
import { CreateForwarderDto } from './dto/create-forwarder.dto';
import { UpdateForwarderDto } from './dto/update-forwarder.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('forwarders')
export class ForwardersController {
  constructor(private service: ForwardersService) {}

  @Get() findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      search,
    );
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateForwarderDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateForwarderDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}