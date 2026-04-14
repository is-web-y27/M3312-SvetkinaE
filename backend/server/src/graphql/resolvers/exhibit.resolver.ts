import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ExhibitsService } from '../../exhibits/exhibits.service';
import { CreateExhibitInput, UpdateExhibitInput } from '../inputs/graphql.inputs';
import { Exhibit } from '../types/exhibit.graphql-type';
import { ExhibitsPage, NewsPage, ReviewsPage } from '../types/pages.graphql-type';

@Resolver(() => Exhibit)
export class ExhibitGraphqlResolver {
  constructor(private readonly exhibitsService: ExhibitsService) {}

  @Query(() => Exhibit, { name: 'exhibit', description: 'Получить экспонат по идентификатору' })
  exhibit(@Args('id', { type: () => Int }) id: number) {
    return this.exhibitsService.findOne(id);
  }

  @Query(() => ExhibitsPage, { name: 'exhibits', description: 'Каталог экспонатов с пагинацией' })
  async exhibits(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.exhibitsService.findManyPaged(offset, limit);
    return { items: data, total, limit, offset };
  }

  @Mutation(() => Exhibit, { description: 'Добавить новый экспонат в каталог' })
  createExhibit(@Args('input') input: CreateExhibitInput) {
    return this.exhibitsService.create(input);
  }

  @Mutation(() => Exhibit, { description: 'Обновить сведения об экспонате' })
  updateExhibit(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateExhibitInput,
  ) {
    return this.exhibitsService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Удалить экспонат из каталога' })
  async deleteExhibit(@Args('id', { type: () => Int }) id: number) {
    await this.exhibitsService.remove(id);
    return true;
  }

  @ResolveField(() => ReviewsPage, { description: 'Отзывы об этом экспонате (постранично)' })
  async reviews(
    @Parent() exhibit: Exhibit,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.exhibitsService.findReviewsForExhibit(exhibit.id, offset, limit);
    return { items: data, total, limit, offset };
  }

  @ResolveField(() => NewsPage, { description: 'Новости, связанные с экспонатом (постранично)' })
  async news(
    @Parent() exhibit: Exhibit,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.exhibitsService.findNewsForExhibit(exhibit.id, offset, limit);
    return { items: data, total, limit, offset };
  }
}
