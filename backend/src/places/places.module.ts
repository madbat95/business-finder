import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { OverpassClientService } from './overpass-client.service';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

@Module({
  imports: [CommonModule],
  controllers: [PlacesController],
  providers: [PlacesService, OverpassClientService],
})
export class PlacesModule {}
