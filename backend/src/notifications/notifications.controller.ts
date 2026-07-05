import { Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Mes notifications',
    description: "Retourne les 50 dernières notifications de l'utilisateur connecté.",
  })
  @ApiResponse({ status: 200, description: 'Liste des notifications' })
  findMine(@GetUser() user: UserResponseDto) {
    return this.notificationsService.findForUser(user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  @ApiResponse({ status: 200, description: '{ count }' })
  unreadCount(@GetUser() user: UserResponseDto) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  @ApiResponse({ status: 200, description: 'Notifications marquées lues' })
  markAllRead(@GetUser() user: UserResponseDto) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiResponse({ status: 200, description: 'Notification marquée lue' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  markRead(@GetUser() user: UserResponseDto, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markRead(user.id, id);
  }
}
