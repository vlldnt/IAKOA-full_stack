import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserFavoritesRepository } from './repositories/user-favorites.repository';
import { CreateUserFavoriteDto } from './dto/create-user-favorite.dto';
import { UserFavoriteResponseDto } from './dto/user-favorite-response.dto';

@Injectable()
export class UserFavoritesService {
  constructor(private readonly userFavoritesRepository: UserFavoritesRepository) {}

  /** Indique si l'erreur Prisma est une violation d'unicité (P2002). */
  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  /**
   * Ajouter un événement aux favoris d'un utilisateur
   */
  async create(createUserFavoriteDto: CreateUserFavoriteDto, authenticatedUserId: string): Promise<UserFavoriteResponseDto> {
    try {
      // Vérifier que l'utilisateur ne peut ajouter des favoris que pour lui-même
      if (createUserFavoriteDto.userId !== authenticatedUserId) {
        throw new ForbiddenException('Vous ne pouvez ajouter des favoris que pour votre propre compte');
      }

      // Vérifier que l'utilisateur existe
      const userExists = await this.userFavoritesRepository.findUser(
        createUserFavoriteDto.userId,
      );

      if (!userExists) {
        throw new NotFoundException(
          `Utilisateur avec l'ID ${createUserFavoriteDto.userId} non trouvé`,
        );
      }

      // Vérifier que l'événement existe
      const eventExists = await this.userFavoritesRepository.findEvent(
        createUserFavoriteDto.eventId,
      );

      if (!eventExists) {
        throw new NotFoundException(
          `Événement avec l'ID ${createUserFavoriteDto.eventId} non trouvé`,
        );
      }

      // Créer le favori
      const favorite = await this.userFavoritesRepository.create(
        createUserFavoriteDto.userId,
        createUserFavoriteDto.eventId,
      );

      return new UserFavoriteResponseDto(favorite);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(`L'utilisateur a déjà ajouté cet événement à ses favoris`);
      }
      throw new InternalServerErrorException("Erreur lors de l'ajout du favori");
    }
  }

  /**
   * Obtenir tous les favoris d'un utilisateur
   */
  async findByUserId(userId: string): Promise<UserFavoriteResponseDto[]> {
    try {
      // Vérifier que l'utilisateur existe
      const userExists = await this.userFavoritesRepository.findUser(userId);

      if (!userExists) {
        throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
      }

      const favorites = await this.userFavoritesRepository.findByUserId(userId);

      return favorites.map(favorite => new UserFavoriteResponseDto(favorite));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la récupération des favoris');
    }
  }

  /**
   * Obtenir tous les utilisateurs qui ont ajouté un événement en favori
   */
  async findByEventId(eventId: string): Promise<UserFavoriteResponseDto[]> {
    try {
      // Vérifier que l'événement existe
      const eventExists = await this.userFavoritesRepository.findEvent(eventId);

      if (!eventExists) {
        throw new NotFoundException(`Événement avec l'ID ${eventId} non trouvé`);
      }

      const favorites = await this.userFavoritesRepository.findByEventId(eventId);

      return favorites.map(favorite => new UserFavoriteResponseDto(favorite));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la récupération des favoris');
    }
  }

  /**
   * Vérifier si un événement est dans les favoris d'un utilisateur
   */
  async isFavorite(userId: string, eventId: string): Promise<boolean> {
    try {
      const favorite = await this.userFavoritesRepository.findOne(userId, eventId);

      return !!favorite;
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la vérification du favori');
    }
  }

  /**
   * Retirer un événement des favoris d'un utilisateur
   */
  async remove(userId: string, eventId: string): Promise<{ message: string }> {
    try {
      // Vérifier que le favori existe
      const favorite = await this.userFavoritesRepository.findOne(userId, eventId);

      if (!favorite) {
        throw new NotFoundException(
          `Favori non trouvé pour l'utilisateur ${userId} et l'événement ${eventId}`,
        );
      }

      await this.userFavoritesRepository.delete(userId, eventId);

      return { message: 'Favori supprimé avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la suppression du favori');
    }
  }

  /**
   * Obtenir le nombre de favoris pour un événement
   */
  async countByEventId(eventId: string): Promise<number> {
    try {
      return await this.userFavoritesRepository.countByEventId(eventId);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors du comptage des favoris');
    }
  }

  /**
   * Supprimer tous les favoris d'un utilisateur
   */
  async removeAllByUserId(userId: string): Promise<{ message: string; count: number }> {
    try {
      const result = await this.userFavoritesRepository.deleteAllByUserId(userId);

      return {
        message: "Tous les favoris de l'utilisateur ont été supprimés",
        count: result.count,
      };
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la suppression des favoris');
    }
  }
}
