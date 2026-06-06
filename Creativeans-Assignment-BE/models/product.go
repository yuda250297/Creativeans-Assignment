package models

// CreateProductRequest defines the structure for creating a product.
type CreateProductRequest struct {
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" validate:"required"`
	Rating      int16   `json:"rating"`
	InStock     bool    `json:"inStock"`
}

// ProductResponse defines the structure for a product in API responses.
type ProductResponse struct {
	ID                int64                     `json:"id"`
	Name              string                    `json:"name"`
	Description       string                    `json:"description"`
	Price             float64                   `json:"price"`
	Rating            int16                     `json:"rating"`
	InStock           bool                      `json:"inStock"`
	ProductCategories []ProductCategoryResponse `json:"productCategories,omitempty"`
	ProductImages     []ProductImageResponse    `json:"productImages,omitempty"`
	CreatedAt         string                    `json:"created_at"`
	TotalCount        int64                     `json:"totalCount,omitempty"`
}

// ProductFilterRequest defines parameters for filtering products via query string.
type ProductFilterRequest struct {
	Q           string   `query:"q"`
	CategoryIDs []int32  `query:"category"`
	MinPrice    *float64 `query:"minPrice"`
	MaxPrice    *float64 `query:"maxPrice"`
	InStock     *bool    `query:"inStock"`
	Sort        string   `query:"sort"`
	Method      string   `query:"method"`
	Page        int32    `query:"page"`
	Limit       int32    `query:"pageSize"`
	Offset      int32    `query:"-"`
}

type ProductDetailsRequest struct {
	ID int64 `uri:"id"`
}

type ProductDetailsResponse struct {
	ID                int64                     `json:"id"`
	Name              string                    `json:"name"`
	Description       string                    `json:"description"`
	Price             float64                   `json:"price"`
	Rating            int16                     `json:"rating"`
	InStock           bool                      `json:"inStock"`
	ProductCategories []ProductCategoryResponse `json:"productCategories,omitempty"`
	ProductImages     []ProductImageResponse    `json:"productImages,omitempty"`
	CreatedAt         string                    `json:"created_at"`
}

// type ProductFilterRequest struct {
// 	Q           string   `query:"q"`
// 	CategoryIDs []int32  `query:"category_ids"`
// 	MinPrice    *float64 `query:"min_price"`
// 	MaxPrice    *float64 `query:"max_price"`
// 	InStock     *bool    `query:"in_stock"`
// 	Sort        string   `query:"sort"`
// 	Method      string   `query:"method"`
// 	Page        int32    `query:"page"`
// 	Limit       int32    `query:"limit"`
// 	Offset      int32    `query:"-"`
// }
