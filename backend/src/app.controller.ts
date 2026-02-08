import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'API Root',
    description: "Point d'entrée de l'API IAKOA.",
  })
  @ApiResponse({
    status: 200,
    description: 'API disponible',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'IAKOA API' },
      },
    },
  })
  getRoot() {
    return { status: 'ok', message: 'IAKOA API' };
  }
}
