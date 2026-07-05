import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email du compte', example: 'jean.dupont@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token reçu par email' })
  @IsString({ message: 'Le token doit être une chaîne de caractères' })
  @MinLength(32, { message: 'Token invalide' })
  token: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial)',
    example: 'Password123!',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/, {
    message: 'Mot de passe: min 8, 1 majuscule, 1 chiffre, 1 spécial',
  })
  password: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token reçu par email' })
  @IsString({ message: 'Le token doit être une chaîne de caractères' })
  @MinLength(32, { message: 'Token invalide' })
  token: string;
}
