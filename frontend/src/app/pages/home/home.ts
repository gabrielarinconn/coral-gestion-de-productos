import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { SearchBar } from '../../shared/components/search-bar/search-bar';
import { Loading } from '../../shared/components/loading/loading';
import { NoResults } from '../../shared/components/no-results/no-results';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { extractErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-home',
  imports: [ProductCard, SearchBar, Loading, NoResults, ErrorMessage],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  searchText = signal('');
  selectedCategoryId = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {
        // El filtro de categorías es secundario: si falla, el listado de
        // productos igual puede funcionar. No bloqueamos la pantalla por esto.
      },
    });
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.productService
      .getAll({
        search: this.searchText() || undefined,
        categoryId: this.selectedCategoryId(),
      })
      .subscribe({
        next: (response) => {
          this.products.set(response.data);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor. Verifica que el backend esté corriendo e inténtalo de nuevo.'
              : extractErrorMessage(error),
          );
        },
      });
  }

  onSearch(text: string): void {
    this.searchText.set(text);
    this.loadProducts();
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategoryId.set(categoryId || undefined);
    this.loadProducts();
  }
}
