import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequireJwt } from '../../auth/decorators/secured.decorators';
import { NewsService } from '../../news/news.service';
import { CreateNewsInput, UpdateNewsInput } from '../inputs/graphql.inputs';
import { News } from '../types/news.graphql-type';
import { NewsPage } from '../types/pages.graphql-type';

@Resolver(() => News)
export class NewsGraphqlResolver {
  constructor(private readonly newsService: NewsService) {}

  @Query(() => News, { name: 'news', description: 'Получить одну новость по идентификатору' })
  news(@Args('id', { type: () => Int }) id: number) {
    return this.newsService.findOne(id);
  }

  @Query(() => NewsPage, { name: 'newsList', description: 'Лента новостей с пагинацией' })
  async newsList(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.newsService.findManyPaged(offset, limit);
    return { items: data, total, limit, offset };
  }

  @RequireJwt()
  @Mutation(() => News, { description: 'Опубликовать новость' })
  publishNews(@Args('input') input: CreateNewsInput) {
    return this.newsService.create({
      title: input.title,
      text: input.text,
      exhibitId: input.exhibitId ?? null,
    });
  }

  @RequireJwt()
  @Mutation(() => News, { description: 'Отредактировать существующую новость' })
  editNews(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateNewsInput,
  ) {
    return this.newsService.update(id, input);
  }

  @RequireJwt()
  @Mutation(() => Boolean, { description: 'Снять новость с публикации (удалить запись)' })
  async withdrawNews(@Args('id', { type: () => Int }) id: number) {
    await this.newsService.remove(id);
    return true;
  }
}
