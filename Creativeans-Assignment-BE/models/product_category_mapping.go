package models

// CreateProductCategoryMappingRequest defines the structure for creating a product category mapping.
type CreateProductCategoryMappingRequest struct {
	ProductID  int64 `json:"product_id" validate:"required"`
	CategoryID int32 `json:"category_id" validate:"required"`
}

// ProductCategoryMappingResponse defines the structure for a product category mapping in API responses.
type ProductCategoryMappingResponse struct {
	ProductID  int64  `json:"product_id"`
	CategoryID int32  `json:"category_id"`
	CreatedAt  string `json:"created_at"`
}
