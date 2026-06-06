package routes

import (
	"assignment-be/provider"

	"github.com/gofiber/fiber/v3"
)

// Setup registers all application routes on the given Fiber app.
func Setup(app *fiber.App, deps *provider.Container) {
	UserRoutes(app, deps.UserHandler)
	ProductRoutes(app, deps.ProductHandler)
	ProductCategoryRoutes(app, deps.ProductCategoryHandler)
}
