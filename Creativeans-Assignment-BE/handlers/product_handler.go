package handlers

import (
	"assignment-be/helpers"
	"assignment-be/models"
	"assignment-be/services"
	"math"
	"net/http"

	"github.com/gofiber/fiber/v3"
)

// ProductHandler manages HTTP requests related to products.
type ProductHandler struct {
	productService services.ProductService
}

// NewProductHandler creates a new product handler.
func NewProductHandler(s services.ProductService) *ProductHandler {
	return &ProductHandler{
		productService: s,
	}
}

// Get Product Details by ID
func (h *ProductHandler) GetProductDetails(c fiber.Ctx) error {
	var req models.ProductDetailsRequest
	if err := c.Bind().URI(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid product ID",
		})
	}

	product, err := h.productService.GetProductDetails(c.Context(), req.ID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Product not found",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Product details retrieved successfully",
		"data":    product,
	})
}

// ListProducts returns a list of products
func (h *ProductHandler) ListProducts(c fiber.Ctx) error {
	var req models.ProductFilterRequest
	if err := c.Bind().Query(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid query parameters",
		})
	}

	// Apply pagination and price defaults
	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Page <= 0 {
		req.Page = 1
	}

	if req.InStock == nil {
		req.InStock = helpers.Ptr(true) // Default to true if not provided
	}

	products, err := h.productService.ListProductsFiltered(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve products",
			"error":   err.Error(),
		})
	}

	totalItems := 0
	if len(products) > 0 {
		totalItems = int(products[0].TotalCount)
	}

	totalPages := int(math.Ceil(float64(totalItems) / float64(req.Limit)))

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Products retrieved successfully",
		"pagination": fiber.Map{
			"page":         req.Page,
			"limit":        req.Limit,
			"total_items":  totalItems,
			"total_pages":  totalPages,
			"has_next":     req.Page < int32(totalPages),
			"has_previous": req.Page > 1,
		},
		"data": products,
	})
}

// CreateProduct registers a product
func (h *ProductHandler) CreateProduct(c fiber.Ctx) error {
	var req models.CreateProductRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	newProduct, err := h.productService.CreateProduct(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create product",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Product created successfully",
		"data":    newProduct,
	})
}
