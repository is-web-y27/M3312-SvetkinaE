import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Категория экспонатов музея' })
export class Category {
  @Field(() => Int, { description: 'Уникальный целочисленный идентификатор категории' })
  id: number;

  @Field(() => String, { description: 'Краткое уникальное имя категории' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Дополнительное текстовое описание категории' })
  description?: string | null;
}
