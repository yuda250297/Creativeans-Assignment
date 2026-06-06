"use client";
import { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
 
const filterSchema = z.object({
  q: z.string(),
  minPrice: z.string(),
  maxPrice: z.string(),
  category: z.array(z.string()),
  inStock: z.boolean(),
  sort: z.string(),
  method: z.string(),
  pageSize: z.number(),
});

type FilterFormData = z.infer<typeof filterSchema>;

export default function ProductFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<FilterFormData>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            q: searchParams.get("q") || "",
            minPrice: searchParams.get("minPrice") || "",
            maxPrice: searchParams.get("maxPrice") || "",
            category: searchParams.get("category")?.split(",").filter(Boolean) || [],
            inStock: searchParams.get("inStock") === "false" ? false : true,
            sort: searchParams.get("sort") || "relevance",
            method: searchParams.get("method") || "desc",
            pageSize: Number(searchParams.get("pageSize")) || 20,
        },
    });

    // Watch all form fields
    const watchedValues = form.watch();
    const { isDirty } = form.formState;

    // Fetch product categories
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Convert URLSearchParams to a plain object for the API call
                setIsLoading(true);
                const response = await apiClient.get('/api/v1/product-categories', {
                    headers: getAuthHeaders()
                });
                setCategories(response.data.data || []);
            } catch (error: any) {
                console.error("Failed to fetch product categories:", error);
                if (error.response?.status === 401) {
                    router.push("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []); // Only fetch categories once on mount to avoid infinite loops

    // Sync URL -> Form state whenever searchParams change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const urlCategories = params.get("category")?.split(",").filter(Boolean) || [];
        
        const urlPageSize = params.get("pageSize");
        const pageSize = urlPageSize ? parseInt(urlPageSize, 10) : 20;

        const newValues = {
            q: params.get("q") || "",
            minPrice: params.get("minPrice") || "",
            maxPrice: params.get("maxPrice") || "",
            category: urlCategories,
            inStock: params.has("inStock") ? params.get("inStock") === "true" : true,
            sort: params.get("sort") || "relevance",
            method: params.get("method") || "desc",
            pageSize: isNaN(pageSize) ? 20 : pageSize,
        };

        // Only reset if values actually differ to prevent unchecking flicker/loops
        const currentValues = form.getValues();
        if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
            form.reset(newValues, { keepDefaultValues: false });
        }
    }, [searchParams, form]);

    // Sync form to URL with debounce and loop prevention
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            
            const qInUrl = params.get("q") || "";
            const minPriceInUrl = params.get("minPrice") || "";
            const maxPriceInUrl = params.get("maxPrice") || "";
            const categoryInUrl = params.get("category") || "";
            const inStockInUrl = params.get("inStock");
            const sortInUrl = params.get("sort");
            const methodInUrl = params.get("method");
            const pageSizeInUrl = params.get("pageSize");

            // Check if any filter value changed compared to what is currently in the URL
            const isFilterModified = 
                qInUrl !== (watchedValues.q || "") ||
                minPriceInUrl !== (watchedValues.minPrice || "") ||
                maxPriceInUrl !== (watchedValues.maxPrice || "") ||
                categoryInUrl !== (watchedValues.category?.join(",") || "") ||
                (inStockInUrl !== null ? inStockInUrl !== String(watchedValues.inStock) : watchedValues.inStock !== true) ||
                (sortInUrl !== null ? sortInUrl !== watchedValues.sort : watchedValues.sort !== "relevance") ||
                (methodInUrl !== null ? methodInUrl !== watchedValues.method : watchedValues.method !== "desc") ||
                (pageSizeInUrl !== null ? pageSizeInUrl !== String(watchedValues.pageSize) : watchedValues.pageSize !== 20);

            // Only sync to URL if the user has manually touched the form (isDirty)
            // This prevents the form from overwriting the URL during navigation/mount
            if (isFilterModified && isDirty) {
                // Reset to page 1 whenever a filter is changed
                params.delete("page");

                // Update params with current form values
                if (watchedValues.q) params.set("q", watchedValues.q); else params.delete("q");
                if (watchedValues.minPrice) params.set("minPrice", watchedValues.minPrice); else params.delete("minPrice");
                if (watchedValues.maxPrice) params.set("maxPrice", watchedValues.maxPrice); else params.delete("maxPrice");
                
                if (watchedValues.category && watchedValues.category.length > 0) {
                    params.set("category", watchedValues.category.join(","));
                } else {
                    params.delete("category");
                }

                params.set("inStock", String(watchedValues.inStock));
                params.set("sort", watchedValues.sort);
                params.set("method", watchedValues.method);
                params.set("pageSize", String(watchedValues.pageSize));

                router.replace(`${pathname}?${params.toString()}`, {
                    scroll: false,
                });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [watchedValues, pathname, router, searchParams, form.formState.isDirty]);

    return (
        <div className="w-full p-4 bg-white rounded-md border">
            <div className="flex flex-col items-start gap-4">
                <p className="text-md font-semibold">FILTERS</p>
                
                    <Form {...form}>
                        <form className="w-full space-y-6">
                            <FormField
                            control={form.control}
                            name="q"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-xs">Keywords</FormLabel>
                                <FormControl>
                                    <Input
                                    className="h-10 rounded-none"
                                    placeholder="Enter keywords"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <div className="flex gap-2">
                                <FormField
                                control={form.control}
                                name="minPrice"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Min Price</FormLabel>
                                    <FormControl>
                                        <Input
                                        className="h-10 rounded-none"
                                        placeholder="Enter min price"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="maxPrice"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Max Price</FormLabel>
                                    <FormControl>
                                        <Input
                                        className="h-10 rounded-none"
                                        placeholder="Enter max price"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>

                                    <div className="space-y-2">
                                        <div className="mb-2">
                                            <FormLabel className="text-xs">Categories</FormLabel>
                                        </div>
                                        <div className="space-y-2">
                                            {isLoading ? (
                                                <p className="text-xs text-gray-400">Loading categories...</p>
                                            ) : categories.length === 0 ? (
                                                <p className="text-xs text-gray-400">No categories found</p>
                                            ) : (
                                                categories.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="category"
                                                    render={({ field }) => {
                                                        const stringId = String(item.id);
                                                        return (
                                                            <FormItem
                                                                key={item.id}
                                                                className="flex flex-row items-center space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(stringId)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, stringId])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== stringId
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-xs font-normal">
                                                                    {item.name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                                ))
                                            )}
                                        </div>
                                    </div>

                            <FormField
                                control={form.control}
                                name="inStock"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs">In Stock Only</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sort"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Sort By</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 rounded-none w-full">
                                                    <SelectValue placeholder="Sort by" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="relevance">Relevance</SelectItem>
                                                <SelectItem value="price">Price</SelectItem>
                                                <SelectItem value="created_at">Create date</SelectItem>
                                                <SelectItem value="rating">Rating</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Sort Method</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 rounded-none w-full">
                                                    <SelectValue placeholder="Sort method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="asc">Ascending</SelectItem>
                                                <SelectItem value="desc">Descending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </form>
                    </Form>

            </div>
        </div>
    );
}