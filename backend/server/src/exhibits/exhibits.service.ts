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

  async findManyPaged(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.exhibit.findMany({
        skip,
        take,
        include: { category: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.exhibit.count(),
    ]);
    return { data, total };
  }

  async findReviewsForExhibit(exhibitId: number, skip: number, take: number) {
    await this.findOne(exhibitId);
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { exhibitId },
        skip,
        take,
        include: { visitor: true, exhibit: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.review.count({ where: { exhibitId } }),
    ]);
    return { data, total };
  }

  async findReviewForExhibit(exhibitId: number, reviewId: number) {
    await this.findOne(exhibitId);
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, exhibitId },
      include: { visitor: true, exhibit: true },
    });
    if (!review) {
      throw new NotFoundException('Отзыв не найден у экспоната');
    }
    return review;
  }

  async findNewsForExhibit(exhibitId: number, skip: number, take: number) {
    await this.findOne(exhibitId);
    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where: { exhibitId },
        skip,
        take,
        include: { exhibit: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.news.count({ where: { exhibitId } }),
    ]);
    return { data, total };
  }

  async findNewsForExhibitById(exhibitId: number, newsId: number) {
    await this.findOne(exhibitId);
    const news = await this.prisma.news.findFirst({
      where: { id: newsId, exhibitId },
      include: { exhibit: true },
    });
    if (!news) {
      throw new NotFoundException('Новость не найдена у экспоната');
    }
    return news;
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

  async update(id: number, data: Partial<ExhibitInput>) {
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
