import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/stats - Vue d'ensemble du tableau de bord
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques globales (admin)',
    description:
      'Compteurs utilisateurs, companies, événements par statut, favoris, catégories, lieux.',
  })
  @ApiResponse({ status: 200, description: 'Statistiques agrégées' })
  @ApiResponse({ status: 403, description: 'Réservé aux administrateurs' })
  getStats() {
    return this.adminService.getStats();
  }
}
