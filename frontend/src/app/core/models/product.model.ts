import { Category } from './category.model';
import { ProductImage } from './product-image.model';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

