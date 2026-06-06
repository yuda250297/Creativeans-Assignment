package routes

import (
	"assignment-be/handlers"
	"assignment-be/middleware"

	"github.com/gofiber/fiber/v3"
)

// ProductCategoryRoutes sets up routes for product category-related operations.
func ProductCategoryRoutes(app *fiber.App, handler *handlers.ProductCategoryHandler) {
	// Group routes under /api/v1/product-categories
	productCategoryGroup := app.Group("/api/v1/product-categories")
	productCategoryGroup.Post("/", middleware.JWTMiddleware, handler.CreateProductCategory)
	productCategoryGroup.Get("/", handler.ListProductCategories)
}
