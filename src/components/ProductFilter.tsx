import React, { useState } from 'react';
import { Slider } from './ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';

interface ProductFilterProps {
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  categories?: string[];
  selectedCategories?: string[];
  onCategoryChange?: (categories: string[]) => void;
  sizes?: string[];
  selectedSizes?: string[];
  onSizeChange?: (size: string) => void;
  colors?: string[];
  selectedColors?: string[];
  onColorChange?: (color: string) => void;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange,
  showClearFilters = true,
  onClearFilters,
  sortBy,
  onSortChange,
}) => {
  const handlePriceChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    onPriceChange(newRange);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filtros</h3>
        {showClearFilters && onClearFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 text-xs">
            <FilterX size={14} className="mr-1" />
            Limpar
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-500">Produtos exibidos cadastrados do menor ao maior preço.</p>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Preço</AccordionTrigger>
          <AccordionContent>
            <div className="py-4 px-1">
              <Slider
                value={priceRange}
                min={minPrice}
                max={maxPrice}
                step={10}
                onValueChange={handlePriceChange}
                className="my-6"
              />
              <div className="flex items-center justify-between text-sm">
                <span>R$ {priceRange[0].toFixed(2)}</span>
                <span>R$ {priceRange[1].toFixed(2)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductFilter;
