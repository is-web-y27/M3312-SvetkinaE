import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequireJwt } from '../../auth/decorators/secured.decorators';
import { ReviewsService } from '../../reviews/reviews.service';
import { CreateReviewInput, UpdateReviewInput } from '../inputs/graphql.inputs';
import { ReviewsPage } from '../types/pages.graphql-type';
import { Review } from '../types/review.graphql-type';

@Resolver(() => Review)
export class ReviewGraphqlResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Query(() => Review, { name: 'review', description: 'Получить отзыв по идентификатору' })
  review(@Args('id', { type: () => Int }) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Query(() => ReviewsPage, { name: 'reviews', description: 'Все отзывы с пагинацией' })
  async reviews(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ) {
    const { data, total } = await this.reviewsService.findManyPaged(offset, limit);
    return { items: data, total, limit, offset };
  }

  @RequireJwt()
  @Mutation(() => Review, { description: 'Оставить новый отзыв об экспонате' })
  leaveReview(@Args('input') input: CreateReviewInput) {
    return this.reviewsService.create(input);
  }

  @RequireJwt()
  @Mutation(() => Review, { description: 'Изменить текст или оценку в отзыве' })
  amendReview(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateReviewInput,
  ) {
    return this.reviewsService.update(id, input);
  }

  @RequireJwt()
  @Mutation(() => Boolean, { description: 'Удалить отзыв' })
  async removeReview(@Args('id', { type: () => Int }) id: number) {
    await this.reviewsService.remove(id);
    return true;
  }
}
