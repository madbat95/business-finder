import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { GeocodeModule } from './geocode/geocode.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [CommonModule, GeocodeModule, PlacesModule],
})
export class AppModule {}
