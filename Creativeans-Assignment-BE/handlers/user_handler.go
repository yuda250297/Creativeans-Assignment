package handlers

import (
	"assignment-be/models"
	"assignment-be/services"
	"fmt"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v3"
)

// Handler manages HTTP requests related to users.
type UserHandler struct {
	userService services.UserService
}

// NewUserHandler creates a new user handler.
func NewUserHandler(s services.UserService) *UserHandler {
	return &UserHandler{
		userService: s,
	}
}

// ListUsers returns a list of users
func (h *UserHandler) ListUsers(c fiber.Ctx) error {
	users, err := h.userService.ListUsers(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve users",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Users retrieved successfully",
		"data":    users,
	})
}

// CreateUser registers a user
func (h *UserHandler) CreateUser(c fiber.Ctx) error {
	var req models.CreateUserRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	newUser, err := h.userService.CreateUser(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create user",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "User created successfully",
		"data":    newUser,
	})
}

// Login handles user authentication
func (h *UserHandler) Login(c fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	authRes, err := h.userService.Login(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login successful",
		"data":    authRes,
	})
}

// GoogleLogin redirects to Google Auth
func (h *UserHandler) GoogleLogin(c fiber.Ctx) error {
	url := h.userService.GetGoogleLoginURL()
	return c.Redirect().To(url)
}

// GoogleCallback handles the Google OAuth redirect
func (h *UserHandler) GoogleCallback(c fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"message": "Code not found"})
	}

	authRes, err := h.userService.HandleGoogleCallback(c.Context(), code)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	// return c.JSON(fiber.Map{
	// 	"success": true,
	// 	"message": "Login successful",
	// 	"data":    authRes,
	// })
	// Get the frontend URL from environment variables

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000" // Default for development
	}

	// Redirect user back to the frontend with the token
	redirectPath := fmt.Sprintf("%s/auth/callback?token=%s", frontendURL, authRes.Token)
	return c.Redirect().To(redirectPath)
}
