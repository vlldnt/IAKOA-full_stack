import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Slug technique (majuscules)', example: 'CONCERT' })
  @IsString()
  @Matches(/^[A-Z0-9_]{2,50}$/, {
    message: 'Le slug doit contenir 2 à 50 caractères en majuscules (A-Z, 0-9, _).',
  })
  slug: string;

  @ApiProperty({ description: 'Libellé affiché', example: 'Concert' })
  @IsString()
  @MaxLength(100)
  label: string;

  @ApiPropertyOptional({ description: 'Couleur hex', example: '#E11D48' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Couleur au format #RRGGBB attendue.' })
  color?: string;

  @ApiPropertyOptional({ description: 'ID du groupe de catégories' })
  @IsOptional()
  @IsUUID('4')
  groupId?: string;

  @ApiPropertyOptional({ description: 'Catégorie active (visible dans les filtres)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class UpdateCategoryGroupDto {
  @ApiPropertyOptional({ description: 'Libellé affiché', example: 'Gastronomie' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional({ description: "Position d'affichage", example: 3 })
  @IsOptional()
  @IsInt()
  position?: number;
}
