import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type NewsInput = {
  title: string;
  text: string;
  exhibitId: number | null;
};

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.news.findMany({
      include: { exhibit: true },
      orderBy: { id: 'desc' },
    });
  }

  async findManyPaged(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        skip,
        take,
        include: { exhibit: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.news.count(),
    ]);
    return { data, total };
  }

  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: { exhibit: true },
    });
    if (!news) {
      throw new NotFoundException('Новость не найдена');
    }
    return news;
  }

  async getExhibits() {
    return this.prisma.exhibit.findMany({ orderBy: { id: 'asc' } });
  }

  async create(data: NewsInput) {
    return this.prisma.news.create({ data });
  }

  async update(id: number, data: Partial<NewsInput>) {
    await this.findOne(id);
    return this.prisma.news.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.news.delete({ where: { id } });
  }
}
