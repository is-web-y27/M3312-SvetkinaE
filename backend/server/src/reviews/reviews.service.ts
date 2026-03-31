import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ReviewInput = {
  rating: number;
  text: string;
  visitorId: number;
  exhibitId: number;
};

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureDefaultExhibit() {
    const existing = await this.prisma.exhibit.findFirst();
    if (existing) {
      return existing;
    }
    let category = await this.prisma.category.findFirst();
    if (!category) {
      category = await this.prisma.category.create({
        data: { name: 'Общее', description: 'Базовая категория музея' },
      });
    }
    return this.prisma.exhibit.create({
      data: {
        title: 'Тестовый экспонат',
        description: 'Создан автоматически для формы отзывов',
        categoryId: category.id,
      },
    });
  }

  private async ensureDefaultVisitor() {
    const email = 'visitor@museum.local';
    const existing = await this.prisma.visitor.findUnique({ where: { email } });
    if (existing) {
      return existing;
    }
    return this.prisma.visitor.create({
      data: {
        name: 'Первый посетитель',
        email,
      },
    });
  }

  async getFormData() {
    await this.ensureDefaultVisitor();
    await this.ensureDefaultExhibit();
    return {
      visitors: await this.prisma.visitor.findMany({ orderBy: { id: 'asc' } }),
      exhibits: await this.prisma.exhibit.findMany({ orderBy: { id: 'asc' } }),
    };
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: { visitor: true, exhibit: true },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { visitor: true, exhibit: true },
    });
    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }
    return review;
  }

  async create(data: ReviewInput) {
    await this.ensureDefaultVisitor();
    return this.prisma.review.create({ data });
  }

  async update(id: number, data: ReviewInput) {
    await this.findOne(id);
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.review.delete({ where: { id } });
  }
}
