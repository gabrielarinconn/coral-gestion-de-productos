import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { Loading } from '../../shared/components/loading/loading';
import { NoResults } from '../../shared/components/no-results/no-results';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { extractErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, Loading, NoResults, ErrorMessage, ConfirmDialog],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private categoryService = inject(CategoryService);
  private confirmDialog = viewChild.required(ConfirmDialog);
  private pendingDeleteId: string | null = null;

  categories = signal<Category[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  saving = signal(false);
  editingId = signal<string | null>(null);

  name = '';
  description = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe((categories) => {
      this.categories.set(categories);
      this.loading.set(false);
    });
  }

  startEdit(category: Category): void {
    this.editingId.set(category.id);
    this.name = category.name;
    this.description = category.description ?? '';
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.name = '';
    this.description = '';
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.name.trim().length < 2) {
      this.errorMessage.set('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    this.saving.set(true);
    const data = { name: this.name, description: this.description || undefined };
    const editingId = this.editingId();

    const request$ = editingId
      ? this.categoryService.update(editingId, data)
      : this.categoryService.create(data);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  askDelete(id: string): void {
    this.pendingDeleteId = id;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.pendingDeleteId) return;

    this.categoryService.remove(this.pendingDeleteId).subscribe({
      next: () => this.loadCategories(),
      error: (error: HttpErrorResponse) => this.errorMessage.set(extractErrorMessage(error)),
    });
    this.pendingDeleteId = null;
  }
}
