import { Injectable } from '@nestjs/common';

/** Servicio raiz de la aplicacion. */
@Injectable()
export class AppService {
  /** @returns Mensaje de saludo por defecto. */
  getHello(): string {
    return 'Hello World!';
  }
}
