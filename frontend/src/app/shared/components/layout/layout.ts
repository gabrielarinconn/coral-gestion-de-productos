import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    // El JWT es stateless (ver FRONTEND_GUIDE.md): el logout real ocurre en
    // el cliente al borrar el token. Si la llamada al backend falla (sin
    // conexión, backend caído), igual queremos cerrar la sesión local -
    // por eso se limpia y se navega tanto en éxito como en error.
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/']);
      },
    });
  }
}
