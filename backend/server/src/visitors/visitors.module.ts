import { Module } from '@nestjs/common';
import { VisitorsApiController } from './visitors-api.controller';
import { VisitorsService } from './visitors.service';

@Module({
  controllers: [VisitorsApiController],
  providers: [VisitorsService],
  exports: [VisitorsService],
})
export class VisitorsModule {}
