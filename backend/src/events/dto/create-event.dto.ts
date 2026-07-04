import {
  IsString,
  IsDateString,
  MaxLength,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDefined,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateMediaDto } from '../../media/dto/create-media.dto';
import { EventCategory } from '@prisma/client';

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude', example: 48.8566, minimum: -90, maximum: 90 })
  @IsNumber({}, { message: 'La latitude doit être un nombre.' })
  @Min(-90, { message: 'La latitude doit être comprise entre -90 et 90.' })
  @Max(90, { message: 'La latitude doit être comprise entre -90 et 90.' })
  lat: number;

  @ApiProperty({ description: 'Longitude', example: 2.3522, minimum: -180, maximum: 180 })
  @IsNumber({}, { message: 'La longitude doit être un nombre.' })
  @Min(-180, { message: 'La longitude doit être comprise entre -180 et 180.' })
  @Max(180, { message: 'La longitude doit être comprise entre -180 et 180.' })
  lng: number;
}

export class LocationDto {
  @ApiProperty({ description: 'Adresse', required: false, example: '123 Rue de la Paix' })
  @IsOptional()
  @IsString({ message: "L'adresse doit être une chaîne de caractères." })
  @MaxLength(255)
  address?: string;

  @ApiProperty({ description: 'Ville', required: false, example: 'Paris' })
  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  @MaxLength(100)
  city?: string;

  @ApiProperty({ description: 'Code postal', required: false, example: '75001' })
  @IsOptional()
  @IsString({ message: 'Le code postal doit être une chaîne de caractères.' })
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ description: 'Pays', required: false, example: 'France' })
  @IsOptional()
  @IsString({ message: 'Le pays doit être une chaîne de caractères.' })
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Coordonnées GPS (requises pour la recherche par distance)' })
  @IsDefined({ message: 'Les coordonnées GPS sont obligatoires.' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
}

export class CreateEventDto {
  @ApiProperty({ description: "Nom de l'événement", maxLength: 100, example: 'Concert de Jazz' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MaxLength(100, { message: "Le nom de l'événement ne peut pas dépasser 100 caractères." })
  name: string;

  @ApiProperty({ description: "Date de l'événement", example: '2024-12-25T20:00:00Z' })
  @IsDateString({}, { message: 'La date doit être au format ISO 8601 valide.' })
  date: string;

  @ApiProperty({
    description: "Description de l'événement",
    maxLength: 5000,
    example: 'Un concert exceptionnel...',
  })
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  @MaxLength(5000, { message: 'La taille maximale de la description est de 5000 caractères.' })
  description: string;

  @ApiProperty({
    description: "Prix de l'événement en centimes",
    minimum: 0,
    default: 0,
    example: 2500,
  })
  @IsInt({ message: 'Le prix doit être un nombre entier.' })
  @Min(0, { message: 'Le prix ne peut pas être négatif.' })
  pricing: number;

  @ApiProperty({
    description: "Localisation de l'événement",
    type: LocationDto,
    example: {
      address: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      coordinates: { lat: 48.8566, lng: 2.3522 },
    },
  })
  @IsDefined({ message: 'La localisation est obligatoire.' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({
    description: 'ID de la société organisatrice',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: "L'ID de la société doit être un UUID valide." })
  companyId: string;

  @ApiProperty({
    description: "Site web de l'événement",
    required: false,
    example: 'https://example.com/event',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Le site web doit être une URL valide.' })
  website?: string;

  @ApiProperty({
    description: "Catégories de l'événement",
    required: false,
    enum: EventCategory,
    isArray: true,
    example: ['CONCERT', 'BAR', 'SOIREE'],
  })
  @IsOptional()
  @IsArray({ message: 'Les catégories doivent être un tableau.' })
  @IsEnum(EventCategory, {
    each: true,
    message: 'Chaque catégorie doit être une valeur valide de EventCategory.',
  })
  categories?: EventCategory[];

  @ApiProperty({
    description: "Liste des médias associés à l'événement",
    required: false,
    type: [CreateMediaDto],
    example: [
      { url: 'https://example.com/images/event1.jpg', type: 'image/jpeg' },
      { url: 'https://example.com/images/event2.jpg', type: 'image/jpeg' },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Les médias doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[];
}
