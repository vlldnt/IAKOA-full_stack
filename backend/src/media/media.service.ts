import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaResponseDto } from './dto/media-response.dto';
import { MediaRepository } from './repositories/media.repository';
import { Role } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async createMany(
    createMediaDtos: CreateMediaDto[],
    eventId: string,
  ): Promise<MediaResponseDto[]> {
    try {
      const mediaData = createMediaDtos.map(dto => ({
        url: dto.url,
        type: dto.type,
        eventId: eventId,
      }));

      const createdMedia = await this.mediaRepository.createMany(mediaData);

      return createdMedia.map(media => new MediaResponseDto(media));
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création des médias.');
    }
  }

  async findByEventIdPublic(eventId: string): Promise<MediaResponseDto[]> {
    try {
      // Vérifier que l'événement existe
      const event = await this.mediaRepository.findEvent(eventId);

      if (!event) {
        throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé.`);
      }

      const media = await this.mediaRepository.findByEventId(eventId);

      return media.map(m => new MediaResponseDto(m));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la récupération des médias.');
    }
  }

  async findByEventId(
    eventId: string,
    userId: string,
    userRole: Role,
  ): Promise<MediaResponseDto[]> {
    try {
      // Vérifier que l'événement existe et récupérer la company associée
      const event = await this.mediaRepository.findEventWithCompany(eventId);

      if (!event) {
        throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé.`);
      }

      // Vérifier que l'utilisateur est le créateur de l'event (propriétaire de la company)
      if (userRole !== Role.ADMIN && event.company.ownerId !== userId) {
        throw new ForbiddenException(
          'Vous ne pouvez accéder aux médias que des événements de vos propres entreprises.',
        );
      }

      const media = await this.mediaRepository.findByEventId(eventId);

      return media.map(m => new MediaResponseDto(m));
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la récupération des médias.');
    }
  }
}
