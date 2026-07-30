import { Global, Module } from '@nestjs/common';
import { TtlCacheService } from './cache/ttl-cache.service';

@Global()
@Module({
  providers: [TtlCacheService],
  exports: [TtlCacheService],
})
export class CommonModule {}
