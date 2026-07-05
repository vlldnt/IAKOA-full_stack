// Mise à jour partielle d'un utilisateur.
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Recevoir les notifications par email' })
  @IsOptional()
  @IsBoolean()
  notifyByEmail?: boolean;
}
