"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProductList from "./product/product-list";
import ProductFilter from "./product/product-filter";

export default function Home() {
  return (
    <div className="w-full border-t py-6 bg-gray-50"> {/* This div provides overall full width, border-t, and vertical padding */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* This main element sets the max width, centers it, and applies horizontal padding */}
        <div className="grid grid-cols-1 md:grid-cols-[250_1fr] w-full border">
          <div className="w-full">
            <ProductFilter />
          </div>
          <div className="border w-full">
            <ProductList />
          </div>
        </div>
      </main>
    </div>
  );
}
