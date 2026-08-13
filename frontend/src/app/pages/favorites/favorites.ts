import { Component, OnInit, inject, signal } from '@angular/core';
import { FavoriteService } from '../../core/services/favorite.service';
import { Product } from '../../core/models/product.model';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Loading } from '../../shared/components/loading/loading';
import { NoResults } from '../../shared/components/no-results/no-results';

@Component({
  selector: 'app-favorites',
  imports: [ProductCard, Loading, NoResults],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  private favoriteService = inject(FavoriteService);

  favorites = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.favoriteService.getAll().subscribe((favorites) => {
      this.favorites.set(favorites);
      this.loading.set(false);
    });
  }
}
