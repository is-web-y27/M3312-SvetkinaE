import { Module } from '@nestjs/common';
import { ExhibitsApiController } from './exhibits-api.controller';
import { ExhibitsController } from './exhibits.controller';
import { ExhibitsService } from './exhibits.service';

@Module({
  controllers: [ExhibitsController, ExhibitsApiController],
  providers: [ExhibitsService],
  exports: [ExhibitsService],
})
export class ExhibitsModule {}
