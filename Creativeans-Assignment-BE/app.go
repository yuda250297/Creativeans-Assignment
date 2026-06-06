package main

import (
	"assignment-be/database"
	"assignment-be/provider"
	"assignment-be/routes"
	"context"

	"flag"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"

	// "github.com/gofiber/fiber/v3/middleware/static"
	"github.com/joho/godotenv"
)

var (
	port = flag.String("port", ":3031", "Port to listen on")
	prod = flag.Bool("prod", false, "Enable prefork in Production")
)

func main() {
	// Load environment variables from .env file
	_ = godotenv.Load()

	// Parse command-line flags
	flag.Parse()

	ctx := context.Background()

	// Connect to database
	pool, err := database.Connect(ctx)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	// Run migrations
	if err := database.Migrate(ctx); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	// Initialize Dependency Injection Container
	container := provider.NewContainer(pool)

	// Create fiber app
	app := fiber.New(fiber.Config{})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())

	// Load allowed origins from environment or use a sensible default for development
	allowOrigins := os.Getenv("ALLOW_ORIGINS")
	if allowOrigins == "" {
		allowOrigins = "http://localhost:3000,http://127.0.0.1:3000,http://103.187.147.37:3000"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     strings.Split(allowOrigins, ","),
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Register application routes from the routes package
	routes.Setup(app, container)

	// Setup static files
	// app.Get("/*", static.New("./static/public"))

	// Handle not founds
	// app.Use(handlers.NotFound)

	// Listen on port 3031
	log.Fatal(app.Listen(*port, fiber.ListenConfig{EnablePrefork: *prod})) // go run app.go -port=:3031
}
