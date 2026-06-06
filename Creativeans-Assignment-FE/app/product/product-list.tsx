"use client";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { authCookies } from "@/lib/cookies";
import { getAuthHeaders } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductList() {
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                // Convert URLSearchParams to a plain object for the API call
                const params: any = Object.fromEntries(searchParams.entries());
                
                if (params.category) {
                    params.category = params.category.split(',');
                }
                
                const response = await apiClient.get('/api/v1/products', { 
                    params,
                    headers: getAuthHeaders()
                });
                setProducts(response.data.data || []);
                setPagination(response.data.pagination);
            } catch (error: any) {
                console.error("Failed to fetch products:", error);
                if (error.response?.status === 401) {
                    router.push("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams]); // Re-run whenever the URL parameters change

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const getPageNumbers = () => {
        if (!pagination) return [];
        const { page: current, total_pages: total } = pagination;
        const delta = 1; // Number of pages to show around current
        const pages = [];

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    const handleSeeProductDetails = (productID: number) => {
        const token = authCookies.getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        router.push(`/product/${productID}`);
    };
    
    return (
        <div className="min-h-screen p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">All Collections</h1>
                    <p className="text-gray-700 text-sm">Showing {products.length} products of {pagination?.total_items || 0}</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Page Size:</span>
                    <Select
                        value={searchParams.get("pageSize") || "20"}
                        onValueChange={(value) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("pageSize", value);
                            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                        }}
                    >
                        <SelectTrigger className="w-[130px] h-9 rounded-none bg-white">
                            <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-3 items-center my-4">
            {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border border-outline-variant rounded-md overflow-hidden bg-white">
                        <Skeleton className="aspect-square w-full rounded-none" />
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-10" />
                            </div>
                            <Skeleton className="h-4 w-3/4" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-8 w-14 rounded-sm" />
                            </div>
                        </div>
                    </div>
                ))
            ) : products.length > 0 ? (
                products.map((product: any) => (
                    <div key={product.id}
                        className="group border border-outline-variant rounded-md overflow-hidden hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 bg-white cursor-pointer"
                        onClick={() => handleSeeProductDetails(product.id)}
                    >
                        <div className="aspect-square relative overflow-hidden bg-surface-container">
                            <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                data-alt={product.description}
                                src={product.productImages[0].image_url}/>
                            {/* <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                data-alt="A professional studio product shot of sleek, matte black noise-canceling headphones placed on a minimalist white stone surface. The lighting is soft and cinematic, highlighting the refined textures and modern corporate aesthetic. The background is a clean, bright, high-key white, creating a premium and focused atmosphere for high-end electronics commerce."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGlYxLfT-wbJTmYLQwK1ucdVRWi5mc2icl8FMx0XYJBx4v8c4gD7wi8pEHzqwNCy1alwMvJUcLEH6Z49PIkjHYeQ5VtXyC3UpzAuV95HJ5Zw5eUi-rUnI8eZDYgXUI7ca5YMKr6WbCj-_ovK_DyGB4QYRKzj2C80Rqu4gK3aHen2KIIWe0OUIJ2PAeEepv_KzHj3F6sJrWXi0rU9x93w60JnqPZW0Jfyk-3NrYVYGw8asCVM37RT983_mvAJQv5xr4s5lkr0x0_W0R"/> */}
                            <span
                                className={`absolute top-3 left-3 text-white text-[10px] px-2 py-1 font-bold rounded ${product.inStock ? 'bg-black' : 'bg-red-500'}`}>{product.inStock ? "In Stock" : "Out of Stock"}</span>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <span
                                    className="text-xs uppercase tracking-widest text-blue-500 font-semibold">{product.productCategories[0].name}</span>
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-500 fill-current" />
                                    <span className="text-label-sm font-bold">{product.rating?.toFixed(1) || "0.0"}</span>
                                </div>
                            </div>
                            <h3 className="text-sm text-primary mb-1 truncate font-semibold">{product.name}</h3>
                            <p
                                className="text-xs line-clamp-2 mb-4">{product.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-md text-primary font-semibold">${product.price.toFixed(2)}</span>
                                <Button
                                    size="sm"
                                    className="px-3 py-2 rounded-sm flex items-center gap-2 bg-green-700 hover:bg-green-600 transition-colors active:scale-95 text-white">
                                    {/* <span
                                        className="material-symbols-outlined text-[18px]"
                                        data-icon="shopping_cart">shopping_cart</span> */}
                                    <span className="text-sm text-label-md">Add</span>
                                </Button>
                                </div>
                            </div>
                    </div>
                    ))
                ) : (
                    <p>No products available.</p>
                )
            }
            
            {/* pagination */}
            {pagination && (
                <div className="flex justify-end items-center mt-6 col-span-full gap-1">
                    <Button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 rounded-sm bg-black hover:bg-green-600 transition-colors"
                    >
                        Previous
                    </Button>
                    <span className="mx-2 text-sm text-gray-700">
                        {pagination.page} of {pagination.total_pages}
                    </span>
                    {/* Page navigation buttons numbers */}
                    {getPageNumbers().map((p, i) => (
                        typeof p === 'number' ? (
                            <Button
                                {...(pagination.page !== p && { 'variant': "outline" })}
                                key={i}
                                onClick={() => handlePageChange(p)}
                                className={`px-3 py-1 rounded-sm cursor-pointer ${pagination.page === p ? 'bg-green-600 text-white' : ' hover:bg-gray-300'}`}
                            >
                                {p}
                            </Button>
                        ) : (
                            <span key={i} className="px-2 text-gray-400">...</span>
                        )
                    ))}
                    <Button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.total_pages}
                        className="px-4 py-2 rounded-sm bg-black hover:bg-green-600 transition-colors cursor-pointer"
                    >
                        Next
                    </Button>
                </div>
            )}

            </div>
        </div>
    );
}