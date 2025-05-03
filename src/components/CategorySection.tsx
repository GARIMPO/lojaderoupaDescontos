
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface CategorySectionProps {
  title: string;
  products: Product[];
  viewAllUrl: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, products, viewAllUrl }) => {
  return (
    <section className="py-8 md:py-12">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <Link to={viewAllUrl} className="text-sm text-shop-red hover:underline">
            Ver todos
          </Link>
        </div>
        
        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
