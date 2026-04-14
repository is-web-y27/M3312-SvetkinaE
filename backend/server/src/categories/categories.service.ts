import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CategoryInput = {
  name: string;
  description?: string | null;
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyPaged(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take,
        orderBy: { id: 'asc' },
      }),
      this.prisma.category.count(),
    ]);
    return { data, total };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    return category;
  }

  async create(data: CategoryInput) {
    return this.prisma.category.create({ data });
  }

  async update(id: number, data: Partial<CategoryInput>) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }

  async findExhibitsForCategory(categoryId: number, skip: number, take: number) {
    await this.findOne(categoryId);
    const [data, total] = await Promise.all([
      this.prisma.exhibit.findMany({
        where: { categoryId },
        skip,
        take,
        include: { category: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.exhibit.count({ where: { categoryId } }),
    ]);
    return { data, total };
  }

  async findExhibitInCategory(categoryId: number, exhibitId: number) {
    await this.findOne(categoryId);
    const exhibit = await this.prisma.exhibit.findFirst({
      where: { id: exhibitId, categoryId },
      include: { category: true },
    });
    if (!exhibit) {
      throw new NotFoundException('Экспонат не найден в категории');
    }
    return exhibit;
  }
}
