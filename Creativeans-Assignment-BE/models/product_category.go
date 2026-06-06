package models

// CreateProductCategoryRequest defines the structure for creating a product category.
type CreateProductCategoryRequest struct {
	Name string `json:"name" validate:"required"`
}

// ProductCategoryResponse defines the structure for a product category in API responses.
type ProductCategoryResponse struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
}
