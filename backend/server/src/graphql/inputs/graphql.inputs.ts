import { Field, InputType, Int } from '@nestjs/graphql';

@InputType({ description: 'Данные для создания категории экспонатов' })
export class CreateCategoryInput {
  @Field(() => String, { description: 'Уникальное имя категории' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Текстовое описание категории' })
  description?: string | null;
}

@InputType({ description: 'Данные для изменения категории' })
export class UpdateCategoryInput {
  @Field(() => String, { nullable: true, description: 'Новое имя категории' })
  name?: string;

  @Field(() => String, { nullable: true, description: 'Новое описание категории' })
  description?: string | null;
}

@InputType({ description: 'Данные для регистрации посетителя' })
export class CreateVisitorInput {
  @Field(() => String, { description: 'Имя посетителя' })
  name: string;

  @Field(() => String, { description: 'Электронная почта (уникальная)' })
  email: string;
}

@InputType({ description: 'Данные для обновления профиля посетителя' })
export class UpdateVisitorInput {
  @Field(() => String, { nullable: true, description: 'Новое имя' })
  name?: string;

  @Field(() => String, { nullable: true, description: 'Новый адрес электронной почты' })
  email?: string;
}

@InputType({ description: 'Данные для добавления экспоната' })
export class CreateExhibitInput {
  @Field(() => String, { description: 'Название экспоната' })
  title: string;

  @Field(() => String, { description: 'Описание экспоната' })
  description: string;

  @Field(() => Int, { description: 'Идентификатор категории' })
  categoryId: number;
}

@InputType({ description: 'Данные для правки экспоната' })
export class UpdateExhibitInput {
  @Field(() => String, { nullable: true, description: 'Новое название' })
  title?: string;

  @Field(() => String, { nullable: true, description: 'Новое описание' })
  description?: string;

  @Field(() => Int, { nullable: true, description: 'Новая категория' })
  categoryId?: number;
}

@InputType({ description: 'Данные для публикации новости' })
export class CreateNewsInput {
  @Field(() => String, { description: 'Заголовок' })
  title: string;

  @Field(() => String, { description: 'Текст новости' })
  text: string;

  @Field(() => Int, { nullable: true, description: 'Привязка к экспонату (необязательно)' })
  exhibitId?: number | null;
}

@InputType({ description: 'Данные для обновления новости' })
export class UpdateNewsInput {
  @Field(() => String, { nullable: true, description: 'Новый заголовок' })
  title?: string;

  @Field(() => String, { nullable: true, description: 'Новый текст' })
  text?: string;

  @Field(() => Int, { nullable: true, description: 'Новая привязка к экспонату или отвязка' })
  exhibitId?: number | null;
}

@InputType({ description: 'Данные для создания отзыва' })
export class CreateReviewInput {
  @Field(() => Int, { description: 'Оценка' })
  rating: number;

  @Field(() => String, { description: 'Текст отзыва' })
  text: string;

  @Field(() => Int, { description: 'Идентификатор посетителя' })
  visitorId: number;

  @Field(() => Int, { description: 'Идентификатор экспоната' })
  exhibitId: number;
}

@InputType({ description: 'Данные для правки отзыва' })
export class UpdateReviewInput {
  @Field(() => Int, { nullable: true, description: 'Новая оценка' })
  rating?: number;

  @Field(() => String, { nullable: true, description: 'Новый текст' })
  text?: string;

  @Field(() => Int, { nullable: true, description: 'Сменить посетителя' })
  visitorId?: number;

  @Field(() => Int, { nullable: true, description: 'Сменить экспонат' })
  exhibitId?: number;
}
