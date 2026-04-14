import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { VisitorsService } from '../../visitors/visitors.service';
import { CreateVisitorInput, UpdateVisitorInput } from '../inputs/graphql.inputs';
import { ReviewsPage, VisitorsPage } from '../types/pages.graphql-type';
import { Visitor } from '../types/visitor.graphql-type';

@Resolver(() => Visitor)
export class VisitorGraphqlResolver {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Query(() => Visitor, { name: 'visitor', description: 'Получить посетителя по идентификатору' })
  visitor(@Args('id', { type: () => Int }) id: number) {
    return this.visitorsService.findOne(id);
  }

  @Query(() => VisitorsPage, { name: 'visitors', description: 'Список посетителей с пагинацией' })
  async visitors(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.visitorsService.findManyPaged(offset, limit);
    return { items: data, total, limit, offset };
  }

  @Mutation(() => Visitor, { description: 'Зарегистрировать нового посетителя' })
  createVisitor(@Args('input') input: CreateVisitorInput) {
    return this.visitorsService.create(input);
  }

  @Mutation(() => Visitor, { description: 'Обновить данные посетителя' })
  updateVisitor(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateVisitorInput,
  ) {
    return this.visitorsService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Удалить запись о посетителе' })
  async deleteVisitor(@Args('id', { type: () => Int }) id: number) {
    await this.visitorsService.remove(id);
    return true;
  }

  @ResolveField(() => ReviewsPage, { description: 'Отзывы, оставленные этим посетителем (постранично)' })
  async reviews(
    @Parent() visitor: Visitor,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.visitorsService.findReviewsForVisitor(visitor.id, offset, limit);
    return { items: data, total, limit, offset };
  }
}
