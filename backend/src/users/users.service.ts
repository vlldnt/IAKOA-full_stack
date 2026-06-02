import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, Prisma, Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersRepository } from './repositories/users.repository';
import * as bcrypt from 'bcrypt';

/** Nombre de tours de salage bcrypt pour le hachage des mots de passe. */
const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Crée un nouvel utilisateur après vérification de l'unicité de l'email.
   *
   * Paramètres : `createUserDto` — nom, email, mot de passe, statut créateur.
   * Retour : l'utilisateur créé, sans données sensibles.
   * Cas d'utilisation : inscription classique (email/mot de passe).
   * Pourquoi : centraliser la validation métier (email unique) et le hachage du
   * mot de passe avant persistance.
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.usersRepository.create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        isCreator: createUserDto.isCreator || false,
      });
      return this.toResponseDto(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw error;
    }
  }

  /**
   * Récupère tous les utilisateurs.
   *
   * Retour : la liste des utilisateurs (sans données sensibles).
   * Cas d'utilisation : administration / listing des comptes.
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => this.toResponseDto(user));
  }

  /**
   * Récupère un utilisateur par son identifiant.
   *
   * Paramètres : `id` — identifiant de l'utilisateur.
   * Retour : l'utilisateur correspondant (sans données sensibles).
   * Cas d'utilisation : consultation d'un profil.
   * @throws {NotFoundException} si l'utilisateur n'existe pas.
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }
    return this.toResponseDto(user);
  }

  /**
   * Récupère un utilisateur complet par email (données sensibles incluses).
   *
   * Paramètres : `email` — email recherché.
   * Retour : l'entité utilisateur brute ou `null`.
   * Cas d'utilisation : authentification (besoin du hash de mot de passe).
   * Pourquoi : réservé à un usage interne (auth), ne pas exposer tel quel.
   */
  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Met à jour un utilisateur.
   *
   * Paramètres :
   * - `id` : identifiant de l'utilisateur.
   * - `updateUserDto` : champs à modifier.
   * - `userRole` : rôle de l'appelant (les champs privilégiés sont ignorés si
   *   l'appelant n'est pas administrateur).
   * Retour : l'utilisateur mis à jour.
   * Cas d'utilisation : édition de profil et changement de mot de passe.
   * @throws {NotFoundException} si l'utilisateur n'existe pas.
   * @throws {ConflictException} si le nouvel email est déjà utilisé.
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    userRole?: Role,
  ): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.findByEmail(updateUserDto.email);
      if (emailExists) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    const data: Prisma.UserUpdateInput = { ...updateUserDto };
    // Seul un administrateur peut modifier le rôle ou le statut de créateur.
    if (userRole !== Role.ADMIN) {
      delete data.role;
      delete data.isCreator;
    }

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, BCRYPT_ROUNDS);
    }

    try {
      const user = await this.usersRepository.update(id, data);
      return this.toResponseDto(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      if (this.isRecordNotFoundError(error)) {
        throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
      }
      throw error;
    }
  }

  /**
   * Supprime un utilisateur.
   *
   * Paramètres : `id` — identifiant de l'utilisateur.
   * Retour : un message de confirmation.
   * Cas d'utilisation : suppression de compte.
   * @throws {NotFoundException} si l'utilisateur n'existe pas.
   */
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    try {
      await this.usersRepository.delete(id);
      return { message: `Utilisateur ${user.name} supprimé avec succès` };
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
      }
      throw error;
    }
  }

  /**
   * Valide les identifiants d'un utilisateur (email + mot de passe).
   *
   * Paramètres : `loginUserDto` — email et mot de passe.
   * Retour : l'utilisateur authentifié (sans données sensibles).
   * Cas d'utilisation : connexion par mot de passe.
   * Pourquoi : centraliser la logique d'authentification et les messages
   * d'erreur neutres (anti-énumération de comptes).
   * @throws {UnauthorizedException} si les identifiants sont invalides.
   */
  async validateUser(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    const user = await this.findByEmail(loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Cet utilisateur utilise une authentification OAuth (Google/Facebook). Veuillez vous connecter avec le même fournisseur.',
      );
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return this.toResponseDto(user);
  }

  /**
   * Retire les champs sensibles (mot de passe, refresh token) d'un utilisateur.
   *
   * Paramètres : `user` — entité utilisateur complète.
   * Retour : l'utilisateur sans données sensibles.
   * Pourquoi : garantir qu'aucun secret ne quitte la couche service.
   */
  private toResponseDto(user: User): UserResponseDto {
    const { password, refreshToken, ...result } = user;
    return result;
  }

  /**
   * Indique si l'erreur Prisma correspond à une violation d'unicité (P2002).
   */
  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  /**
   * Indique si l'erreur Prisma correspond à un enregistrement absent (P2025).
   */
  private isRecordNotFoundError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
  }
}
