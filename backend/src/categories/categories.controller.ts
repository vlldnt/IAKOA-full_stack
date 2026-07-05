import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, UpdateCategoryGroupDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /categories - Catalogue public (groupes + catégories actives)
   */
  @Get()
  @ApiOperation({ summary: 'Catalogue des catégories groupées (public)' })
  @ApiResponse({ status: 200, description: 'Groupes ordonnés avec leurs catégories actives' })
  findAllGrouped() {
    return this.categoriesService.findAllGrouped();
  }

  /**
   * GET /categories/admin - Liste complète pour le back-office
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Liste admin (inclut inactives + compteur d’usage)' })
  @ApiResponse({ status: 403, description: 'Réservé aux administrateurs' })
  findAllAdmin() {
    return this.categoriesService.findAllAdmin();
  }

  /**
   * POST /categories - Créer une catégorie (admin)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une catégorie (admin)' })
  @ApiResponse({ status: 409, description: 'Slug déjà utilisé' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  /**
   * PATCH /categories/groups/:id - Modifier un groupe (admin)
   */
  @Patch('groups/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier un groupe de catégories (admin)' })
  updateGroup(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryGroupDto) {
    return this.categoriesService.updateGroup(id, dto);
  }

  /**
   * PATCH /categories/:id - Modifier une catégorie (admin)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier une catégorie (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  /**
   * DELETE /categories/:id - Supprimer une catégorie (admin)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une catégorie (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
