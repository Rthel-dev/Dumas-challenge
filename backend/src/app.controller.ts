import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

/** Controlador raiz de la aplicacion (sin endpoints expuestos). */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
