import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type VisitorInput = {
  name: string;
  email: string;
};

@Injectable()
export class VisitorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyPaged(skip: number, take: number) {
    const [data, total] = await Promise.all([
      this.prisma.visitor.findMany({
        skip,
        take,
        orderBy: { id: 'asc' },
      }),
      this.prisma.visitor.count(),
    ]);
    return { data, total };
  }

  async findOne(id: number) {
    const visitor = await this.prisma.visitor.findUnique({ where: { id } });
    if (!visitor) {
      throw new NotFoundException('Посетитель не найден');
    }
    return visitor;
  }

  async create(data: VisitorInput) {
    return this.prisma.visitor.create({ data });
  }

  async update(id: number, data: Partial<VisitorInput>) {
    await this.findOne(id);
    return this.prisma.visitor.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.visitor.delete({ where: { id } });
  }

  async findReviewsForVisitor(visitorId: number, skip: number, take: number) {
    await this.findOne(visitorId);
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { visitorId },
        skip,
        take,
        include: { visitor: true, exhibit: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.review.count({ where: { visitorId } }),
    ]);
    return { data, total };
  }

  async findReviewForVisitor(visitorId: number, reviewId: number) {
    await this.findOne(visitorId);
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, visitorId },
      include: { visitor: true, exhibit: true },
    });
    if (!review) {
      throw new NotFoundException('Отзыв не найден у посетителя');
    }
    return review;
  }
}
