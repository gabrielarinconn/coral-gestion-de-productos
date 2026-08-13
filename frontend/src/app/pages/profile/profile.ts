import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { Loading } from '../../shared/components/loading/loading';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { extractErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, DatePipe, Loading, ErrorMessage],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private userService = inject(UserService);

  user = signal<User | null>(null);
  loading = signal(true);
  loadError = signal<string | null>(null);

  currentPassword = '';
  newPassword = '';
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);
  savingPassword = signal(false);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.loadError.set(extractErrorMessage(error));
      },
    });
  }

  onChangePassword(): void {
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    if (!this.currentPassword) {
      this.passwordError.set('Ingresa tu contraseña actual.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.savingPassword.set(true);
    this.userService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        this.savingPassword.set(false);
        this.passwordSuccess.set(response.message);
        this.currentPassword = '';
        this.newPassword = '';
      },
      error: (error: HttpErrorResponse) => {
        // Un 401 aquí significa "contraseña actual incorrecta", no sesión
        // expirada - el interceptor ya sabe no desloguear en esta ruta.
        this.savingPassword.set(false);
        this.passwordError.set(extractErrorMessage(error));
      },
    });
  }
}
