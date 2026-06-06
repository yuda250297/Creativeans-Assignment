package services

import (
	"assignment-be/models"
	"context"
)

// ProductRepository defines the data access contract for products.
// This allows us to swap sqlc for a mock or another database easily.
type ProductRepository interface {
	CreateProduct(ctx context.Context, req models.CreateProductRequest) (*models.ProductResponse, error)
	ListProducts(ctx context.Context) ([]models.ProductResponse, error)
	ListProductsFiltered(ctx context.Context, req models.ProductFilterRequest) ([]models.ProductResponse, error)
	GetProductDetails(ctx context.Context, id int64) (*models.ProductDetailsResponse, error)
}

// ProductService defines the interface for product-related business logic.
type ProductService interface {
	CreateProduct(ctx context.Context, req models.CreateProductRequest) (*models.ProductResponse, error)
	ListProducts(ctx context.Context) ([]models.ProductResponse, error)
	ListProductsFiltered(ctx context.Context, req models.ProductFilterRequest) ([]models.ProductResponse, error)
	GetProductDetails(ctx context.Context, id int64) (*models.ProductDetailsResponse, error)
}

// productService implements the ProductService interface.
type productService struct {
	repo ProductRepository
}

// NewProductService creates a new product service.
func NewProductService(repo ProductRepository) ProductService {
	return &productService{
		repo: repo,
	}
}

// CreateProduct implements the Service interface for creating a product.
func (s *productService) CreateProduct(ctx context.Context, req models.CreateProductRequest) (*models.ProductResponse, error) {
	return s.repo.CreateProduct(ctx, req)
}

// GetProductDetails implements the Service interface for getting product details by ID.
func (s *productService) GetProductDetails(ctx context.Context, id int64) (*models.ProductDetailsResponse, error) {
	return s.repo.GetProductDetails(ctx, id)
}

// ListProducts implements the Service interface for listing all products.
func (s *productService) ListProducts(ctx context.Context) ([]models.ProductResponse, error) {
	return s.repo.ListProducts(ctx)
}

// ListProductsFiltered implements the Service interface for filtered products.
func (s *productService) ListProductsFiltered(ctx context.Context, req models.ProductFilterRequest) ([]models.ProductResponse, error) {
	// Calculate offset: (Page 1 - 1) * 10 = 0; (Page 2 - 1) * 10 = 10
	if req.Page > 0 {
		req.Offset = (req.Page - 1) * req.Limit
	}

	return s.repo.ListProductsFiltered(ctx, req)
}
