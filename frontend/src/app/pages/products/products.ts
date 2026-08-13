import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService, ProductPayload } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Loading } from '../../shared/components/loading/loading';
import { NoResults } from '../../shared/components/no-results/no-results';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { extractErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-products',
  imports: [FormsModule, CurrencyPipe, Loading, NoResults, ErrorMessage, ConfirmDialog],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private confirmDialog = viewChild.required(ConfirmDialog);
  private pendingDeleteId: string | null = null;

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  editingId = signal<string | null>(null);

  name = '';
  description = '';
  price: number | null = null;
  stock: number | null = null;
  categoryId = '';
  imagesText = '';

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((categories) => this.categories.set(categories));
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAll({ limit: 100 }).subscribe((response) => {
      this.products.set(response.data);
      this.loading.set(false);
    });
  }

  startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.name = product.name;
    this.description = product.description ?? '';
    this.price = product.price;
    this.stock = product.stock;
    this.categoryId = product.categoryId;
    this.imagesText = product.images.map((image) => image.url).join(', ');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.name = '';
    this.description = '';
    this.price = null;
    this.stock = null;
    this.categoryId = '';
    this.imagesText = '';
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.name.trim().length < 2) {
      this.errorMessage.set('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (this.price === null || this.price <= 0) {
      this.errorMessage.set('El precio debe ser mayor a 0.');
      return;
    }
    if (this.stock === null || this.stock < 0) {
      this.errorMessage.set('El stock no puede ser negativo.');
      return;
    }
    if (!this.categoryId) {
      this.errorMessage.set('Selecciona una categoría.');
      return;
    }

    const images = this.imagesText
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const data: ProductPayload = {
      name: this.name,
      description: this.description || undefined,
      price: this.price,
      stock: this.stock,
      categoryId: this.categoryId,
      images,
    };

    this.saving.set(true);
    const editingId = this.editingId();
    const request$ = editingId
      ? this.productService.update(editingId, data)
      : this.productService.create(data);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.loadProducts();
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

    this.productService.remove(this.pendingDeleteId).subscribe({
      next: () => this.loadProducts(),
      error: (error: HttpErrorResponse) => this.errorMessage.set(extractErrorMessage(error)),
    });
    this.pendingDeleteId = null;
  }
}
