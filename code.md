Got it — here is a **career-standard NestJS + Prisma backend** setup **all at once** for:

* **Auth (users)**: register/login (JWT)
* **CRUD**: suppliers, forwarders, orders (+ items), invoices
* **DTOs + validations**
* **Prisma relations** (as you described)

I’ll assume you already have:

* `apps/api/prisma/schema.prisma` with those models
* `apps/api/src/prisma/prisma.service.ts` + `prisma.module.ts`
* Global `ValidationPipe` enabled in `main.ts`

If anything differs, still follow this structure.

---

# 0) Install required packages (api)

From repo root:

```bash
pnpm --filter api add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm --filter api add -D @types/bcrypt @types/passport-jwt
pnpm --filter api add class-validator class-transformer
```

---

# 1) Global validation (confirm)

`apps/api/src/main.ts` must include:

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

---

# 2) Prisma schema reminder (status enum)

In your `schema.prisma`, make sure `status` is an enum like `OrderStatus`. (You already did similar.)

---

# 3) Folder structure (career-standard)

Create these modules:

```
src/
  auth/
  users/
  suppliers/
  forwarders/
  orders/
  invoices/
  common/
```

Each module: `controller.ts`, `service.ts`, `module.ts`, `dto/`

---

# 4) AUTH (Users + JWT)

## 4.1 Users DTOs

`src/users/dto/create-user.dto.ts`

```ts
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}
```

## 4.2 Users service

`src/users/users.service.ts`

```ts
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { email: dto.email, password: passwordHash, name: dto.name },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findMe(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }
}
```

## 4.3 Auth DTOs

`src/auth/dto/login.dto.ts`

```ts
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
```

## 4.4 JWT strategy + guard

`src/auth/jwt.strategy.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: { sub: string; email: string; role: string }) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

`src/auth/jwt.guard.ts`

```ts
import { AuthGuard } from '@nestjs/passport';
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## 4.5 Auth service

`src/auth/auth.service.ts`

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken: token };
  }
}
```

## 4.6 Auth controller

`src/auth/auth.controller.ts`

```ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.users.findMe(req.user.userId);
  }
}
```

## 4.7 Auth module

`src/auth/auth.module.ts`

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

## 4.8 Users module

`src/users/users.module.ts`

```ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

✅ Add to `AppModule` imports: `AuthModule`

---

# 5) SUPPLIERS CRUD

`src/suppliers/dto/create-supplier.dto.ts`

```ts
import { IsString, MinLength } from 'class-validator';
export class CreateSupplierDto {
  @IsString()
  @MinLength(2)
  name: string;
}
```

`src/suppliers/dto/update-supplier.dto.ts`

```ts
import { IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
```

`src/suppliers/suppliers.service.ts`

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  update(id: string, dto: UpdateSupplierDto) {
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }
}
```

`src/suppliers/suppliers.controller.ts`

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateSupplierDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
```

`src/suppliers/suppliers.module.ts`

```ts
import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

@Module({ controllers: [SuppliersController], providers: [SuppliersService] })
export class SuppliersModule {}
```

---

# 6) FORWARDERS CRUD (same pattern)

Copy Suppliers and replace `Supplier` → `Forwarder`.

---

# 7) ORDERS CRUD + ITEMS (transaction) + validation

## 7.1 Order item DTO

`src/orders/dto/order-item.dto.ts`

```ts
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class OrderItemDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  @MinLength(1)
  itemName: string;

  @IsInt()
  @Min(1)
  quantity: number;

  // We'll accept numbers and store as Decimal
  @Min(0)
  price: number;

  @Min(0)
  total: number;
}
```

## 7.2 Create order DTO (with items)

`src/orders/dto/create-order.dto.ts`

```ts
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export enum OrderStatusDto {
  DRAFT = 'DRAFT',
  PLACED = 'PLACED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export class CreateOrderDto {
  @IsString()
  refNumber: string;

  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsUUID()
  forwarderId?: string;

  @IsOptional()
  @IsEnum(OrderStatusDto)
  status?: OrderStatusDto;

  @IsOptional() @IsDateString() orderDate?: string;
  @IsOptional() @IsDateString() dispatchDate?: string;
  @IsOptional() @IsDateString() estimatedDeliveryDate?: string;
  @IsOptional() @IsDateString() actualDeliveryDate?: string;

  @IsOptional() @IsString() shipmentName?: string;
  @IsOptional() @IsString() comments?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}
```

## 7.3 Update order DTO

`src/orders/dto/update-order.dto.ts`

```ts
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderStatusDto } from './create-order.dto';

export class UpdateOrderDto {
  @IsOptional() @IsUUID() supplierId?: string;
  @IsOptional() @IsUUID() forwarderId?: string;

  @IsOptional() @IsEnum(OrderStatusDto) status?: OrderStatusDto;

  @IsOptional() @IsDateString() orderDate?: string;
  @IsOptional() @IsDateString() dispatchDate?: string;
  @IsOptional() @IsDateString() estimatedDeliveryDate?: string;
  @IsOptional() @IsDateString() actualDeliveryDate?: string;

  @IsOptional() @IsString() shipmentName?: string;
  @IsOptional() @IsString() comments?: string;
}
```

## 7.4 Orders service (CRUD + transaction create)

`src/orders/orders.service.ts`

```ts
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
```

## 7.5 Orders controller (protected with JWT)

`src/orders/orders.controller.ts`

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateOrderDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateOrderDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
```

`src/orders/orders.module.ts`

```ts
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({ controllers: [OrdersController], providers: [OrdersService] })
export class OrdersModule {}
```

---

# 8) INVOICES CRUD (nested under order is common)

## DTOs

`src/invoices/dto/create-invoice.dto.ts`

```ts
import { IsDateString, IsString, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  orderId: string;

  @IsString()
  invoiceNumber: string;

  @IsDateString()
  invoiceDate: string;
}
```

`src/invoices/invoices.service.ts`

```ts
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
```

`src/invoices/invoices.controller.ts`

```ts
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() dto: CreateInvoiceDto) { return this.service.create(dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
```

`src/invoices/invoices.module.ts`

```ts
import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({ controllers: [InvoicesController], providers: [InvoicesService] })
export class InvoicesModule {}
```

---

# 9) Add modules to AppModule

`src/app.module.ts`

```ts
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
```

---

# 10) Environment variables

`apps/api/.env`

```env
DATABASE_URL="postgresql://app:app@localhost:5432/order_tracking?schema=public"
JWT_SECRET="change-me-super-secret"
```

---

# 11) Endpoints you will have

### Auth

* `POST /auth/register`
* `POST /auth/login`
* `GET /auth/me` (Bearer token)

### Suppliers (JWT)

* `GET/POST/PATCH/DELETE /suppliers`

### Forwarders (JWT)

* `GET/POST/PATCH/DELETE /forwarders`

### Orders (JWT)

* `GET /orders`
* `GET /orders/:id`
* `POST /orders` (supports `items: []`)
* `PATCH /orders/:id`
* `DELETE /orders/:id`

### Invoices (JWT)

* `GET /invoices`
* `POST /invoices`
* `DELETE /invoices/:id`

---

## Two important “career notes”

1. **Money fields**: Prisma uses `Decimal` → we accept numbers in DTOs for simplicity, but in real production you may use strings for exactness.
2. **Role/RBAC**: later you can add `@Roles()` + guard.

---

If you want, paste your current `schema.prisma` and I’ll quickly verify:

* enum names match DTO status
* `onDelete` behavior matches what you want
* invoice relation (1→many vs 1→1) is correct