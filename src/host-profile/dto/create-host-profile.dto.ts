import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateHostProfileDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({ example: 'Farah Host' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ example: '+33600000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '1 rue test' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Sanary-sur-Mer' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'FR' })
  @IsOptional()
  @IsString()
  country?: string;
}
