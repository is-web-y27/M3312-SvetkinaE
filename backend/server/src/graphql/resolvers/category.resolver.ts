import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { RequireAdmin } from '../../auth/decorators/secured.decorators';
import { CategoriesService } from '../../categories/categories.service';
import { CreateCategoryInput, UpdateCategoryInput } from '../inputs/graphql.inputs';
import { Category } from '../types/category.graphql-type';
import { CategoriesPage, ExhibitsPage } from '../types/pages.graphql-type';

@Resolver(() => Category)
export class CategoryGraphqlResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => Category, { name: 'category', description: 'Получить одну категорию по идентификатору' })
  category(@Args('id', { type: () => Int }) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Query(() => CategoriesPage, { name: 'categories', description: 'Список категорий с пагинацией по limit и offset' })
  async categories(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.categoriesService.findManyPaged(offset, limit);
    return { items: data, total, limit, offset };
  }

  @RequireAdmin()
  @Mutation(() => Category, { description: 'Добавить новую категорию экспонатов' })
  createCategory(@Args('input') input: CreateCategoryInput) {
    return this.categoriesService.create(input);
  }

  @RequireAdmin()
  @Mutation(() => Category, { description: 'Изменить существующую категорию' })
  updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(id, input);
  }

  @RequireAdmin()
  @Mutation(() => Boolean, { description: 'Удалить категорию по идентификатору' })
  async deleteCategory(@Args('id', { type: () => Int }) id: number) {
    await this.categoriesService.remove(id);
    return true;
  }

  @ResolveField(() => ExhibitsPage, { description: 'Экспонаты в данной категории (постраничная выборка)' })
  async exhibits(
    @Parent() category: Category,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.categoriesService.findExhibitsForCategory(category.id, offset, limit);
    return { items: data, total, limit, offset };
  }
}
