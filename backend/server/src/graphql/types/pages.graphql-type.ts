import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Category } from './category.graphql-type';
import { Exhibit } from './exhibit.graphql-type';
import { News } from './news.graphql-type';
import { Review } from './review.graphql-type';
import { Visitor } from './visitor.graphql-type';

@ObjectType({ description: 'Постраничный результат выборки категорий' })
export class CategoriesPage {
  @Field(() => [Category], { description: 'Категории на текущей странице' })
  items: Category[];

  @Field(() => Int, { description: 'Общее количество категорий в базе' })
  total: number;

  @Field(() => Int, { description: 'Максимальное число записей на странице' })
  limit: number;

  @Field(() => Int, { description: 'Смещение от начала полной выборки' })
  offset: number;
}

@ObjectType({ description: 'Постраничный результат выборки посетителей' })
export class VisitorsPage {
  @Field(() => [Visitor], { description: 'Посетители на текущей странице' })
  items: Visitor[];

  @Field(() => Int, { description: 'Общее количество посетителей' })
  total: number;

  @Field(() => Int, { description: 'Максимальное число записей на странице' })
  limit: number;

  @Field(() => Int, { description: 'Смещение от начала полной выборки' })
  offset: number;
}

@ObjectType({ description: 'Постраничный результат выборки экспонатов' })
export class ExhibitsPage {
  @Field(() => [Exhibit], { description: 'Экспонаты на текущей странице' })
  items: Exhibit[];

  @Field(() => Int, { description: 'Общее количество экспонатов' })
  total: number;

  @Field(() => Int, { description: 'Максимальное число записей на странице' })
  limit: number;

  @Field(() => Int, { description: 'Смещение от начала полной выборки' })
  offset: number;
}

@ObjectType({ description: 'Постраничный результат выборки новостей' })
export class NewsPage {
  @Field(() => [News], { description: 'Новости на текущей странице' })
  items: News[];

  @Field(() => Int, { description: 'Общее количество новостей' })
  total: number;

  @Field(() => Int, { description: 'Максимальное число записей на странице' })
  limit: number;

  @Field(() => Int, { description: 'Смещение от начала полной выборки' })
  offset: number;
}

@ObjectType({ description: 'Постраничный результат выборки отзывов' })
export class ReviewsPage {
  @Field(() => [Review], { description: 'Отзывы на текущей странице' })
  items: Review[];

  @Field(() => Int, { description: 'Общее количество отзывов' })
  total: number;

  @Field(() => Int, { description: 'Максимальное число записей на странице' })
  limit: number;

  @Field(() => Int, { description: 'Смещение от начала полной выборки' })
  offset: number;
}
