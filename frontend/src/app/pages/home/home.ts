import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { SearchBar } from '../../shared/components/search-bar/search-bar';
import { Loading } from '../../shared/components/loading/loading';
import { NoResults } from '../../shared/components/no-results/no-results';

@Component({
  selector: 'app-home',
  imports: [ProductCard, SearchBar, Loading, NoResults],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  searchText = signal('');
  selectedCategoryId = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((categories) => this.categories.set(categories));
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService
      .getAll({
        search: this.searchText() || undefined,
        categoryId: this.selectedCategoryId(),
      })
      .subscribe((response) => {
        this.products.set(response.data);
        this.loading.set(false);
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
