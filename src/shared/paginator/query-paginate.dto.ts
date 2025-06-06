import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { environment } from '../config/env';

const responseLimit = environment.API_RESPONSE_LIMIT ?? 20;

export class QueryPaginateDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ type: 'string' })
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ type: 'string' })
  @Max(+responseLimit)
  limit?: number;
}
