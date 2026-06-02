import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CompaniesRepository } from './repositories/companies.repository';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  /** Indique si l'erreur Prisma est une violation d'unicité (P2002). */
  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  /** Indique si l'erreur Prisma est un enregistrement absent (P2025). */
  private isRecordNotFoundError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
  }

  async create(
    createCompanyDto: CreateCompanyDto,
    userId: string,
    isCreator: boolean,
  ): Promise<CompanyResponseDto> {
    // Vérifier que l'utilisateur est un créateur
    if (!isCreator) {
      throw new UnauthorizedException(
        'Seuls les utilisateurs créateurs peuvent créer des entreprises. Contactez un administrateur pour obtenir ce statut.',
      );
    }

    try {
      const company = await this.companiesRepository.create({
        name: createCompanyDto.name,
        siren: createCompanyDto.siren,
        description: createCompanyDto.description ?? undefined,
        website: createCompanyDto.website ?? undefined,
        socialNetworks: createCompanyDto.socialNetworks
          ? JSON.parse(JSON.stringify(createCompanyDto.socialNetworks))
          : undefined,
        isValidated: createCompanyDto.isValidated ?? false,
        owner: { connect: { id: userId } },
      });

      return new CompanyResponseDto(company);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Une entreprise avec le SIREN ${createCompanyDto.siren} existe déjà.`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<CompanyResponseDto[]> {
    const companies = await this.companiesRepository.findAll();
    return companies.map(company => new CompanyResponseDto(company));
  }

  async findAllByOwner(userId: string): Promise<CompanyResponseDto[]> {
    const companies = await this.companiesRepository.findAllByOwner(userId);
    return companies.map(company => new CompanyResponseDto(company));
  }

  async findOne(id: string, userId: string, userRole: Role): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findById(id);

    if (!company) {
      throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée.`);
    }

    if (userRole !== Role.ADMIN && company.ownerId !== userId) {
      throw new UnauthorizedException(`Vous n'avez pas accès à cette entreprise.`);
    }

    return new CompanyResponseDto(company);
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: string,
    userRole: Role,
  ): Promise<CompanyResponseDto> {
    const company = await this.companiesRepository.findById(id);

    if (!company) {
      throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée.`);
    }

    if (userRole !== Role.ADMIN && company.ownerId !== userId) {
      throw new UnauthorizedException(`Vous n'êtes pas autorisé à modifier cette entreprise.`);
    }

    try {
      const updatedCompany = await this.companiesRepository.update(id, {
        name: updateCompanyDto.name ?? undefined,
        siren: updateCompanyDto.siren ?? undefined,
        description: updateCompanyDto.description ?? undefined,
        website: updateCompanyDto.website ?? undefined,
        socialNetworks: updateCompanyDto.socialNetworks
          ? JSON.parse(JSON.stringify(updateCompanyDto.socialNetworks))
          : undefined,
        isValidated: updateCompanyDto.isValidated ?? undefined,
      });

      return new CompanyResponseDto(updatedCompany);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Une entreprise avec le SIREN ${updateCompanyDto.siren} existe déjà.`,
        );
      }
      if (this.isRecordNotFoundError(error)) {
        throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée.`);
      }
      throw error;
    }
  }

  async remove(id: string, userId: string, userRole: Role): Promise<{ message: string }> {
    const company = await this.companiesRepository.findById(id);

    if (!company) {
      throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée.`);
    }

    if (userRole !== Role.ADMIN && company.ownerId !== userId) {
      throw new UnauthorizedException(`Vous n'êtes pas autorisé à supprimer cette entreprise.`);
    }

    try {
      await this.companiesRepository.delete(id);

      return { message: `Entreprise ${company.name} supprimée avec succès.` };
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée.`);
      }
      throw error;
    }
  }
}
