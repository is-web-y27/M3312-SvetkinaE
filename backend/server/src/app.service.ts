import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getExhibits() {
    return this.prisma.exhibit.findMany({
      include: { category: true },
      orderBy: { id: 'desc' },
      take: 3,
    });
  }

  async getNews() {
    return this.prisma.news.findMany({
      include: { exhibit: true },
      orderBy: { id: 'desc' },
      take: 3,
    });
  }
}
