import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Category } from './category.graphql-type';

@ObjectType({ description: 'Экспонат музейной коллекции' })
export class Exhibit {
  @Field(() => Int, { description: 'Уникальный идентификатор экспоната' })
  id: number;

  @Field(() => String, { description: 'Заголовок или краткое название экспоната' })
  title: string;

  @Field(() => String, { description: 'Развёрнутое текстовое описание экспоната' })
  description: string;

  @Field(() => GraphQLISODateTime, { description: 'Дата и время добавления экспоната в каталог' })
  createdAt: Date;

  @Field(() => Int, { description: 'Идентификатор категории, к которой относится экспонат' })
  categoryId: number;

  @Field(() => String, {
    nullable: true,
    description: 'Публичный URL изображения-обложки (Object Storage)',
  })
  coverImageUrl?: string | null;

  @Field(() => Category, { description: 'Категория, в которой числится экспонат' })
  category: Category;
}
