package routes

import (
	"assignment-be/handlers"
	"assignment-be/middleware"

	"github.com/gofiber/fiber/v3"
)

// UserRoutes sets up routes for user-related operations.
func UserRoutes(app *fiber.App, handler *handlers.UserHandler) {
	// Group routes under /api/v1/users
	userGroup := app.Group("/api/v1/users")
	userGroup.Post("/", handler.CreateUser)
	userGroup.Post("/login", handler.Login)
	userGroup.Get("/auth/google", handler.GoogleLogin)
	userGroup.Get("/auth/google/callback", handler.GoogleCallback)

	// Protected routes
	userGroup.Get("/", middleware.JWTMiddleware, handler.ListUsers)
}
