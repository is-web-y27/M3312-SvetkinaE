import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import type { Request, Response } from 'express';
import depthLimit from 'graphql-depth-limit';
import { createComplexityRule, simpleEstimator } from 'graphql-query-complexity';
import { CategoriesModule } from '../categories/categories.module';
import { ExhibitsModule } from '../exhibits/exhibits.module';
import { NewsModule } from '../news/news.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { VisitorsModule } from '../visitors/visitors.module';
import { CategoryGraphqlResolver } from './resolvers/category.resolver';
import { ExhibitGraphqlResolver } from './resolvers/exhibit.resolver';
import { NewsGraphqlResolver } from './resolvers/news.resolver';
import { ReviewGraphqlResolver } from './resolvers/review.resolver';
import { VisitorGraphqlResolver } from './resolvers/visitor.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: true,
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
      validationRules: [
        depthLimit(12),
        createComplexityRule({
          maximumComplexity: 1500,
          estimators: [simpleEstimator({ defaultComplexity: 1 })],
        }),
      ],
    }),
    CategoriesModule,
    ExhibitsModule,
    NewsModule,
    ReviewsModule,
    VisitorsModule,
  ],
  providers: [
    CategoryGraphqlResolver,
    VisitorGraphqlResolver,
    ExhibitGraphqlResolver,
    NewsGraphqlResolver,
    ReviewGraphqlResolver,
  ],
})
export class MuseumGraphqlModule {}
