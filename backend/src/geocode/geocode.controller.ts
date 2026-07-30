import { Controller, Get, Query } from '@nestjs/common';
import type { GeocodeResult } from '@business-finder/shared';
import { GeocodeQueryDto } from './dto/geocode-query.dto';
import { GeocodeService } from './geocode.service';

@Controller('geocode')
export class GeocodeController {
  constructor(private readonly geocodeService: GeocodeService) {}

  @Get()
  async geocode(@Query() query: GeocodeQueryDto): Promise<GeocodeResult> {
    return this.geocodeService.geocode(query.q);
  }
}
