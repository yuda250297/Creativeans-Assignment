package provider

import (
	sqlc "assignment-be/database/sqlc"
	"assignment-be/handlers"
	"assignment-be/repositories"
	"assignment-be/services"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Container holds all the handlers/controllers for the application.
type Container struct {
	UserHandler            *handlers.UserHandler
	ProductHandler         *handlers.ProductHandler
	ProductCategoryHandler *handlers.ProductCategoryHandler
	// Add more handlers here as your app grows
}

// NewContainer initializes all services and handlers.
func NewContainer(pool *pgxpool.Pool) *Container {
	queries := sqlc.New(pool)

	// Initialize User Module
	userRepo := repositories.NewPostgresUserRepo(queries)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	// Initialize Product Module
	productRepo := repositories.NewPostgresProductRepo(queries)
	productService := services.NewProductService(productRepo)
	productHandler := handlers.NewProductHandler(productService)

	// Initialize Product Category Module
	productCategoryRepo := repositories.NewPostgresProductCategoryRepo(queries)
	productCategoryService := services.NewProductCategoryService(productCategoryRepo)
	productCategoryHandler := handlers.NewProductCategoryHandler(productCategoryService)

	return &Container{
		UserHandler:            userHandler,
		ProductHandler:         productHandler,
		ProductCategoryHandler: productCategoryHandler,
	}
}
