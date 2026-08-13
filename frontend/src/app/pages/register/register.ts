import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { extractErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.name.trim().length < 2) {
      this.errorMessage.set('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (!this.email) {
      this.errorMessage.set('El correo es obligatorio.');
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.loading.set(true);
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
