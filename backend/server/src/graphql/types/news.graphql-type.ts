import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Exhibit } from './exhibit.graphql-type';

@ObjectType({ description: 'Новостная заметка о музее или экспонате' })
export class News {
  @Field(() => Int, { description: 'Уникальный идентификатор новости' })
  id: number;

  @Field(() => String, { description: 'Заголовок новости' })
  title: string;

  @Field(() => String, { description: 'Полный текст новости' })
  text: string;

  @Field(() => GraphQLISODateTime, { description: 'Время публикации новости' })
  publishedAt: Date;

  @Field(() => Int, { nullable: true, description: 'Идентификатор связанного экспоната, если новость привязана' })
  exhibitId?: number | null;

  @Field(() => Exhibit, { nullable: true, description: 'Экспонат, к которому отнесена новость' })
  exhibit?: Exhibit | null;
}
