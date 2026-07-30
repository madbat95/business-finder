import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { PlacesResponse } from '@business-finder/shared';
import { placesToCsv } from '../common/utils/csv-serializer.util';
import { PlacesExportQueryDto } from './dto/places-export-query.dto';
import { PlacesRequestDto } from './dto/places-request.dto';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  async findPlaces(@Body() body: PlacesRequestDto): Promise<PlacesResponse> {
    return this.placesService.findPlaces(body);
  }

  @Get('export')
  async exportPlaces(
    @Query() query: PlacesExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const response = await this.placesService.findPlaces(query);
    const csv = placesToCsv(response.results);
    const filename = `places-export-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.send(csv);
  }
}
