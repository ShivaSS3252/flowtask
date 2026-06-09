import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check — no authentication required' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  check() {
    return {
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
