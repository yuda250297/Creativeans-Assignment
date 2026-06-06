package models

// ProductImageResponse defines the structure for a product image in API responses.
type ProductImageResponse struct {
	ID        int64  `json:"id"`
	ImageURL  string `json:"image_url"`
	CreatedAt string `json:"created_at"`
}

// CreateProductImageRequest defines the structure for creating a product image.
type CreateProductImageRequest struct {
	ProductID int64  `json:"product_id"`
	ImageURL  string `json:"image_url"`
}
