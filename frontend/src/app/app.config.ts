import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router'; 
import { provideHttpClient } from '@angular/common/http'; // permite que Angular utilice las rutas definidas en app.routes.ts.

import { routes } from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideHttpClient()],
};
