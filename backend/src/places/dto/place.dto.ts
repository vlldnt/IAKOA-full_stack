import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({ description: 'Nom du lieu', example: 'Salle des fêtes de Rodez' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ description: 'Adresse', example: '1 place Foch' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: 'Ville', example: 'Rodez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Code postal', example: '12000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Pays', example: 'France' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Latitude', example: 44.3497 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: 2.5737 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {}
