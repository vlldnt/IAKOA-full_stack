import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  static setup(app: INestApplication, path: string = 'api/docs'): void {
    const config = new DocumentBuilder()
      .setTitle('IAKOA Backend API')
      .setDescription(
        "Documentation complète de l'API IAKOA Backend\n\n" +
          '## Authentification\n' +
          "Cette API utilise JWT Bearer token pour l'authentification.\n" +
          '1. Utilisez `/auth/login` ou `/auth/register` pour obtenir un access token\n' +
          '2. Cliquez sur le bouton "Authorize" en haut à droite\n' +
          '3. Entrez votre token dans le format: `Bearer <votre-token>`\n' +
          '4. Les routes protégées afficheront un cadenas 🔒',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Entrez votre JWT token',
          in: 'header',
        },
        'JWT-auth', // Nom de la référence de sécurité
      )
      .addTag('auth', "Endpoints d'authentification (register, login, refresh, logout)")
      .addTag('users', 'Gestion des utilisateurs')
      .addTag('companies', 'Gestion des entreprises')
      .addTag('health', "Health check de l'application")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(path, app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Garde le token en mémoire même après refresh
        tagsSorter: 'alpha', // Trie les tags alphabétiquement
        operationsSorter: 'alpha', // Trie les opérations alphabétiquement
      },
      customSiteTitle: 'IAKOA API Documentation',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    });

    console.log(
      `📚 Swagger UI disponible sur: http://localhost:${process.env.PORT ?? 3000}/${path}`,
    );
  }

  static shouldEnable(): boolean {
    const nodeEnv = process.env.NODE_ENV;
    return !nodeEnv || nodeEnv === 'development';
  }
}
