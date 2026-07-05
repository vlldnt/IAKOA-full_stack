import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ValidateCompanyDto {
  @ApiProperty({ description: 'Entreprise validée ou non', example: true })
  @IsBoolean({ message: 'isValidated doit être un booléen.' })
  isValidated: boolean;
}
