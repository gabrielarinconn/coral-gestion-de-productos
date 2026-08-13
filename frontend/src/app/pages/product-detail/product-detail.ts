import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { Loading } from '../../shared/components/loading/loading';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { extractErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, Loading, ErrorMessage],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private favoriteService = inject(FavoriteService);
  authService = inject(AuthService);

  product = signal<Product | null>(null);
  loading = signal(true);
  loadError = signal<string | null>(null);
  isFavorite = signal(false);
  favoriteLoading = signal(false);

  ngOnInit(): void {
    this.loadProduct();

    const id = this.route.snapshot.paramMap.get('id')!;
    if (this.authService.isLoggedIn()) {
      this.favoriteService.getAll().subscribe({
        next: (favorites) => {
          this.isFavorite.set(favorites.some((favorite) => favorite.id === id));
        },
        error: () => {
          // Si no se puede saber el estado de favorito, se deja en falso
          // por defecto - no bloquea ver el resto del detalle.
        },
      });
    }
  }

  loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.loadError.set(null);
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.loadError.set(extractErrorMessage(error));
      },
    });
  }

  toggleFavorite(): void {
    const product = this.product();
    if (!product) return;

    this.favoriteLoading.set(true);
    const request$ = this.isFavorite()
      ? this.favoriteService.remove(product.id)
      : this.favoriteService.add(product.id);

    request$.subscribe({
      next: () => {
        this.isFavorite.set(!this.isFavorite());
        this.favoriteLoading.set(false);
      },
      error: () => this.favoriteLoading.set(false),
    });
  }
}
