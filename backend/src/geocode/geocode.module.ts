import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { GeocodeController } from './geocode.controller';
import { GeocodeService } from './geocode.service';

@Module({
  imports: [CommonModule],
  controllers: [GeocodeController],
  providers: [GeocodeService],
})
export class GeocodeModule {}
