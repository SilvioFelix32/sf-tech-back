import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

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
  @Max(+process.env.API_RESPONSE_LIMIT || 20)
  limit?: number;
}

export class CognitoQueryPaginateDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ type: 'number', example: 10 })
  @Max(+process.env.API_RESPONSE_LIMIT || 20)
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', example: 'some-pagination-token' })
  paginationToken?: string;
}
