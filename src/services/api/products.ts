/**
 * Products API Service
 *
 * Handles product-related API operations including
 * fetching products, categories, and searching.
 */

import apiClient, { apiUtils } from './client';

// Product response interface (raw API response)
export interface ProductResponse {
    id?: string;
    _id?: string;
    name: string;
    description?: string;
    price?: number;
    costPrice?: number;
    sellingPrice?: number;
    discount?: number;
    quantity?: number;
    images?: string[];
    category?: string;
    isAvailable?: boolean;
    isSbAvailable?: boolean;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    merchantId?: string;
    productId?: {
        name: string;
        description?: string;
        slug: string;
        categoryId?: {
            title: string;
            id: string;
        };
        id: string;
        [key: string]: any;
    };
}

// Normalized product interface
export interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    sellingPrice?: number;
    discount?: number;
    quantity?: number;
    images: string[];
    category: string;
    categoryName?: string;
    isAvailable: boolean;
    isSbAvailable?: boolean;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    _id?: string;
    title: string;
    description?: string;
    image?: string;
    productsCount?: number;
}

export interface PaginatedResponse<T> {
    results: T[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

// Helper function to normalize product data
function normalizeProduct(product: ProductResponse): Product {
    // Handle nested productId structure
    const price = product.sellingPrice || product.costPrice || product.price || 0;

    return {
        _id: product.id || product._id || '',
        name: product.name || product.productId?.name || '',
        description: product.description || product.productId?.description,
        price: price,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        discount: product.discount,
        quantity: product.quantity,
        images: product.images || [],
        category: product.category || product.productId?.categoryId?.id || '',
        categoryName: product.productId?.categoryId?.title,
        isAvailable: product.isAvailable !== false,
        isSbAvailable: product.isSbAvailable,
        tags: product.tags || [],
        createdAt: product.createdAt || '',
        updatedAt: product.updatedAt || '',
    };
}

// Products API Service
export class ProductsService {
    /**
     * Get all product categories
     */
    async getCategories(): Promise<Category[]> {
        try {
            const response = await apiUtils.requestWithRetry(
                () => apiClient.get<Category[]>('/stores/categories'),
                2,
                1000
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            throw error;
        }
    }

    /**
     * Get products available for SB packages (paginated)
     */
    async getSBProducts(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Product>> {
        try {
            const response = await apiUtils.requestWithRetry(
                () => apiClient.get<PaginatedResponse<ProductResponse>>(
                    `/products/catalogue?page=${page}&limit=${limit}`
                ),
                2,
                1000
            );

            return {
                results: response.data.results.map(normalizeProduct),
                page: response.data.page,
                limit: response.data.limit,
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
            };
        } catch (error) {
            console.error('Failed to fetch SB products:', error);
            throw error;
        }
    }

    /**
     * Get products by category (paginated)
     */
    async getProductsByCategory(
        categoryId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<Product>> {
        try {
            const response = await apiUtils.requestWithRetry(
                () => apiClient.get<PaginatedResponse<ProductResponse>>(
                    `/products/catalogue?categoryId=${categoryId}&page=${page}&limit=${limit}`
                ),
                2,
                1000
            );

            return {
                results: response.data.results.map(normalizeProduct),
                page: response.data.page,
                limit: response.data.limit,
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
            };
        } catch (error) {
            console.error('Failed to fetch products by category:', error);
            throw error;
        }
    }

    /**
     * Search products (paginated)
     */
    async searchProducts(
        query: string,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<Product>> {
        try {
            const response = await apiUtils.requestWithRetry(
                () => apiClient.get<PaginatedResponse<ProductResponse>>(
                    `/products/catalogue?search=${query}&page=${page}&limit=${limit}`
                ),
                2,
                1000
            );

            return {
                results: response.data.results.map(normalizeProduct),
                page: response.data.page,
                limit: response.data.limit,
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
            };
        } catch (error) {
            console.error('Failed to search products:', error);
            throw error;
        }
    }

    /**
     * Get single product details
     */
    async getProductById(productId: string): Promise<Product> {
        try {
            const response = await apiUtils.requestWithRetry(
                () => apiClient.get<ProductResponse>(`/products/catalogue/${productId}`),
                2,
                1000
            );
            return normalizeProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product details:', error);
            throw error;
        }
    }
}

// Export singleton instance
const productsService = new ProductsService();
export default productsService;