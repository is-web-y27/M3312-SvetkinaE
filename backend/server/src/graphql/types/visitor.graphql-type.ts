import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Зарегистрированный посетитель музея' })
export class Visitor {
  @Field(() => Int, { description: 'Уникальный идентификатор посетителя' })
  id: number;

  @Field(() => String, { description: 'Отображаемое имя посетителя' })
  name: string;

  @Field(() => String, { description: 'Уникальный адрес электронной почты' })
  email: string;

  @Field(() => GraphQLISODateTime, { description: 'Время создания записи о посетителе' })
  createdAt: Date;
}
