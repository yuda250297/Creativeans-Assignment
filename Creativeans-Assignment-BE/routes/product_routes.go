package routes

import (
	"assignment-be/handlers"
	"assignment-be/middleware"

	"github.com/gofiber/fiber/v3"
)

// ProductRoutes sets up routes for product-related operations.
func ProductRoutes(app *fiber.App, handler *handlers.ProductHandler) {
	// Group routes under /api/v1/products
	productGroup := app.Group("/api/v1/products")
	productGroup.Post("/", middleware.JWTMiddleware, handler.CreateProduct)
	productGroup.Get("/:id", middleware.JWTMiddleware, handler.GetProductDetails)
	productGroup.Get("/", handler.ListProducts)
	// productGroup.Put("/:id", middleware.JWTMiddleware, handler.UpdateProduct)
	// productGroup.Delete("/:id", middleware.JWTMiddleware, handler.DeleteProduct)
}
