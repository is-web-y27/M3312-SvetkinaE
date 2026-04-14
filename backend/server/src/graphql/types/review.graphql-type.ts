import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Exhibit } from './exhibit.graphql-type';
import { Visitor } from './visitor.graphql-type';

@ObjectType({ description: 'Отзыв посетителя об экспонате' })
export class Review {
  @Field(() => Int, { description: 'Уникальный идентификатор отзыва' })
  id: number;

  @Field(() => Int, { description: 'Числовая оценка экспоната' })
  rating: number;

  @Field(() => String, { description: 'Текст отзыва' })
  text: string;

  @Field(() => GraphQLISODateTime, { description: 'Время создания отзыва' })
  createdAt: Date;

  @Field(() => Int, { description: 'Идентификатор посетителя — автора отзыва' })
  visitorId: number;

  @Field(() => Int, { description: 'Идентификатор экспоната, к которому относится отзыв' })
  exhibitId: number;

  @Field(() => Visitor, { description: 'Посетитель, оставивший отзыв' })
  visitor: Visitor;

  @Field(() => Exhibit, { description: 'Экспонат, о котором написан отзыв' })
  exhibit: Exhibit;
}
