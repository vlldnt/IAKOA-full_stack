import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ModerateEventDto {
  @ApiProperty({
    description: 'Nouveau statut de l’événement',
    enum: EventStatus,
    example: EventStatus.PUBLISHED,
  })
  @IsEnum(EventStatus, { message: 'Statut invalide.' })
  status: EventStatus;

  @ApiPropertyOptional({
    description: 'Motif (obligatoire en cas de refus)',
    example: 'Description incomplète : précisez le lieu exact.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  moderationNote?: string;
}
