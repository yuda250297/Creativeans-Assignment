package services

import (
	"assignment-be/models"
	"context"
)

// ProductCategoryRepository defines the data access contract for product categories.
// This allows us to swap sqlc for a mock or another database easily.
type ProductCategoryRepository interface {
	CreateProductCategory(ctx context.Context, req models.CreateProductCategoryRequest) (*models.ProductCategoryResponse, error)
	ListProductCategories(ctx context.Context) ([]models.ProductCategoryResponse, error)
}

// ProductCategoryService defines the interface for product category-related business logic.
type ProductCategoryService interface {
	CreateProductCategory(ctx context.Context, req models.CreateProductCategoryRequest) (*models.ProductCategoryResponse, error)
	ListProductCategories(ctx context.Context) ([]models.ProductCategoryResponse, error)
}

// productCategoryService implements the ProductCategoryService interface.
type productCategoryService struct {
	repo ProductCategoryRepository
}

// NewProductCategoryService creates a new product category service.
func NewProductCategoryService(repo ProductCategoryRepository) ProductCategoryService {
	return &productCategoryService{
		repo: repo,
	}
}

// CreateProductCategory implements the ProductCategoryService interface for creating a product category.
func (s *productCategoryService) CreateProductCategory(ctx context.Context, req models.CreateProductCategoryRequest) (*models.ProductCategoryResponse, error) {
	return s.repo.CreateProductCategory(ctx, req)
}

// ListProductCategories implements the ProductCategoryService interface for listing all product categories.
func (s *productCategoryService) ListProductCategories(ctx context.Context) ([]models.ProductCategoryResponse, error) {
	return s.repo.ListProductCategories(ctx)
}
