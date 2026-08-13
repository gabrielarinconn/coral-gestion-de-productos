import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { Loading } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, Loading],
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
  isFavorite = signal(false);
  favoriteLoading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.productService.getById(id).subscribe((product) => {
      this.product.set(product);
      this.loading.set(false);
    });

    if (this.authService.isLoggedIn()) {
      this.favoriteService.getAll().subscribe((favorites) => {
        this.isFavorite.set(favorites.some((favorite) => favorite.id === id));
      });
    }
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
