package handlers

import (
	"assignment-be/models"
	"assignment-be/services"
	"net/http"

	"github.com/gofiber/fiber/v3"
)

// ProductCategoryHandler manages HTTP requests related to product categories.
type ProductCategoryHandler struct {
	productCategoryService services.ProductCategoryService
}

// NewProductCategoryHandler creates a new product category handler.
func NewProductCategoryHandler(s services.ProductCategoryService) *ProductCategoryHandler {
	return &ProductCategoryHandler{
		productCategoryService: s,
	}
}

// CreateProductCategory creates a new product category
func (h *ProductCategoryHandler) CreateProductCategory(c fiber.Ctx) error {
	var req models.CreateProductCategoryRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	newProductCategory, err := h.productCategoryService.CreateProductCategory(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create product category",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Product category created successfully",
		"data":    newProductCategory,
	})
}

// ListProductCategories returns a list of product categories
func (h *ProductCategoryHandler) ListProductCategories(c fiber.Ctx) error {
	productCategories, err := h.productCategoryService.ListProductCategories(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve product categories",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Product categories retrieved successfully",
		"data":    productCategories,
	})
}
