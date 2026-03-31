import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ExhibitInput = {
  title: string;
  description: string;
  categoryId: number;
};

@Injectable()
export class ExhibitsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureDefaultCategory() {
    const existing = await this.prisma.category.findFirst();
    if (existing) {
      return existing;
    }
    return this.prisma.category.create({
      data: { name: 'Общее', description: 'Базовая категория музея' },
    });
  }

  async getCategories() {
    await this.ensureDefaultCategory();
    return this.prisma.category.findMany({ orderBy: { id: 'asc' } });
  }

  async findAll() {
    return this.prisma.exhibit.findMany({
      include: { category: true },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const exhibit = await this.prisma.exhibit.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!exhibit) {
      throw new NotFoundException('Экспонат не найден');
    }
    return exhibit;
  }

  async create(data: ExhibitInput) {
    await this.ensureDefaultCategory();
    return this.prisma.exhibit.create({ data });
  }

  async update(id: number, data: ExhibitInput) {
    await this.findOne(id);
    return this.prisma.exhibit.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.exhibit.delete({ where: { id } });
  }
}
