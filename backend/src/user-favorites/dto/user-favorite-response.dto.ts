import { ApiProperty } from '@nestjs/swagger';
import { EventResponseDto } from '../../events/dto/event-response.dto';

export class UserFavoriteResponseDto {
  @ApiProperty({
    description: 'ID du favori',
    example: 'cm2xxxxxxxxxxxx',
  })
  id: string;

  @ApiProperty({
    description: 'Date de création du favori',
    example: '2024-12-03T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: "ID de l'utilisateur",
    example: 'cm2xxxxxxxxxxxx',
  })
  userId: string;

  @ApiProperty({
    description: "ID de l'événement",
    example: 'cm2yyyyyyyyyyyy',
  })
  eventId: string;

  @ApiProperty({
    description: "Informations sur l'événement (format identique aux endpoints /events)",
    required: false,
    type: EventResponseDto,
  })
  event?: EventResponseDto;

  @ApiProperty({
    description: "Informations sur l'utilisateur",
    required: false,
  })
  user?: {
    id: string;
    name: string;
    email: string;
    isCreator: boolean;
  };

  constructor(partial: Partial<UserFavoriteResponseDto>) {
    Object.assign(this, partial);
  }
}
