"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { authCookies } from "@/lib/cookies";
import { getAuthHeaders } from "@/lib/auth";

const images = [
  "https://placehold.co/600x400/EEE/31343C?font=playfair-display&text=Pencil+Case+Arc%0A01",
  "https://placehold.co/600x400/EEE/31343C?font=playfair-display&text=Pencil+Case+Arc%0A02",
  "https://placehold.co/600x400/EEE/31343C?font=playfair-display&text=Pencil+Case+Arc%0A03",
  "https://placehold.co/600x400/EEE/31343C?font=playfair-display&text=Pencil+Case+Arc%0A04"
];
export default function ProductDetail({ params }: { params: Promise<{ productID: string }> }) {
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [id, setId] = useState<string | null>(null);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const token = authCookies.getToken();
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    useEffect(() => {
        params.then((resolvedParams) => {
        setId(resolvedParams.productID);
        });
    }, [params]);

    // / Fetch product details using the id
    useEffect(() => {
        const fetchProducts = async () => {
            const token = authCookies.getToken();
            if (!id || !token) return;

            try {
                // Convert URLSearchParams to a plain object for the API call
                setLoading(true);
                const response = await apiClient.get(`/api/v1/products/${id}`, {
                    headers: getAuthHeaders()
                });
                setProduct(response.data.data || null);
            } catch (error: any) {
                console.error("Failed to fetch product details:", error);
                if (error.response?.status === 401) {
                    router.push("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [id]);

    const displayImages = product?.productImages?.length > 0 
        ? product.productImages.map((img: any) => img.image_url) 
        : images;

    return (
        <div className="w-full border-t py-6 bg-gray-50 "> {/* This div provides overall full width, border-t, and vertical padding */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen p-6"> {/* This main element sets the max width, centers it, and applies horizontal padding */}
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8">
                {loading || !product ? (
                    <>
                        {/* Left Column Skeleton */}
                        <div className="w-full md:sticky md:top-6 self-start space-y-4">
                            <Skeleton className="aspect-[3/2] w-full rounded-xl" />
                            <div className="grid grid-cols-5 gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                        {/* Right Column Skeleton */}
                        <div className="w-full py-4 space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-3/4" />
                            </div>
                            <Skeleton className="h-24 w-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-28 rounded-full" />
                                <Skeleton className="h-8 w-28 rounded-full" />
                            </div>
                            <Skeleton className="h-12 w-32" />
                            <div className="flex gap-4">
                                <Skeleton className="h-12 flex-1" />
                                <Skeleton className="h-12 flex-1" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                    <div className="w-full md:sticky md:top-6 self-start">
                    <div className="flex flex-col gap-4 w-full">
                    {/* Hero Image Section */}
                    <div className="overflow-hidden rounded-xl bg-white">
                        <AspectRatio ratio={3 / 2}>
                        <img 
                            src={displayImages[active]} 
                            alt="Product View" 
                            className="w-full h-full object-cover" 
                        />
                        </AspectRatio>
                    </div>

                    {/* Thumbnails Row */}
                    <div className="grid grid-cols-5 gap-2 w-full">
                        {displayImages.map((img: string, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setActive(idx)}
                            className={cn(
                            "rounded-lg overflow-hidden border-2 transition-all",
                            active === idx ? "border-black" : "border-transparent"
                            )}
                        >
                            <AspectRatio ratio={1 / 1}>
                            {img === "video-placeholder" ? (
                                <div className="bg-slate-100 flex items-center justify-center h-full text-xs">Video</div>
                            ) : (
                                <img src={img} className="object-cover w-full h-full" />
                            )}
                            </AspectRatio>
                        </button>
                        ))}
                    </div>
                    </div>

                </div>
                <div className="w-full py-4">
                    <span className="text-xs uppercase tracking-widest text-blue-500 font-semibold">
                        {product.productCategories?.[0]?.name || "Uncategorized"}
                    </span>
                    <h1 className="text-3xl font-semibold my-2">{product.name}</h1>
                    <p className="text-sm text-gray-700 my-2">{product.description}</p>
                    
                    <div className="flex w-full gap-1 my-4">
                        {
                            product.productCategories?.map((cat: any) => (
                                <Badge key={cat.id} variant={"outline"} className="px-3 py-1 rounded-full text-sm bg-gray-200">{cat.name}</Badge>
                            ))
                        }
                        {/* <Badge variant={"outline"} className="px-3 py-1 rounded-full text-sm bg-gray-200">Free Shipping</Badge>
                        <Badge variant={"outline"} className="px-3 py-1 rounded-full text-sm bg-gray-200">30-Day Returns</Badge>
                        <Badge variant={"outline"} className="px-3 py-1 rounded-full text-sm bg-gray-200">24/7 Support</Badge> */}
                    </div>

                    <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-current" />
                        <span className="text-label-sm font-bold">{product.rating?.toFixed(1) || "0.0"}</span>
                    </div>

                    <div className="flex flex-col my-6">
                        <p className="text-4xl font-bold text-primary">${product.price?.toFixed(2)}</p>
                        <p className="text-sm font-semibold text-gray-500">{product.inStock ? "In Stock" : "Out of Stock"}</p>
                    </div>
                    
                    <div className="flex items-center justify-between w-full gap-4">
                        <Button className="flex-1 px-6 py-3 h-12 bg-green-700 text-white rounded-none hover:bg-green-800 transition w-full">Add to Cart</Button>
                        <Button variant={"outline"} className="flex-1 px-6 py-3 h-12 rounded-none hover:bg-black hover:text-white transition w-full">Wishlist</Button>
                    </div>
                    
                    
                </div>
                </>
                )}
            </div>
            </main>
        </div>
        // <div>
        //   <h1>Product ID: {id}</h1>
        //   {/* You can now fetch data using this id */}
        // </div>
  );
}