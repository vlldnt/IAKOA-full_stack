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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PlacesService } from './places.service';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/place.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  /**
   * GET /places - Liste des lieux (PUBLIC)
   */
  @Get()
  @ApiOperation({ summary: 'Liste des lieux, filtrable par ville (public)' })
  @ApiQuery({ name: 'city', required: false })
  findAll(@Query('city') city?: string) {
    return this.placesService.findAll(city);
  }

  /**
   * GET /places/:id - Détail d'un lieu (PUBLIC)
   */
  @Get(':id')
  @ApiOperation({ summary: "Détail d'un lieu (public)" })
  @ApiResponse({ status: 404, description: 'Lieu non trouvé' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.placesService.findOne(id);
  }

  /**
   * POST /places - Créer un lieu (admin)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un lieu (admin)' })
  create(@Body() dto: CreatePlaceDto) {
    return this.placesService.create(dto);
  }

  /**
   * PATCH /places/:id - Modifier un lieu (admin)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier un lieu (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  /**
   * DELETE /places/:id - Supprimer un lieu (admin)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer un lieu (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.placesService.remove(id);
  }
}
