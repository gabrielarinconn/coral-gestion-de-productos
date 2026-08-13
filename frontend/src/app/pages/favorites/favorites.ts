import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FavoriteService } from '../../core/services/favorite.service';
import { Product } from '../../core/models/product.model';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Loading } from '../../shared/components/loading/loading';
import { NoResults } from '../../shared/components/no-results/no-results';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { extractErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-favorites',
  imports: [ProductCard, Loading, NoResults, ErrorMessage],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  private favoriteService = inject(FavoriteService);

  favorites = signal<Product[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.favoriteService.getAll().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
