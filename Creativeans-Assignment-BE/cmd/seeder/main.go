package main

import (
	"assignment-be/database"
	sqlc "assignment-be/database/sqlc"
	"assignment-be/models"
	"assignment-be/repositories"
	"context"
	"fmt"
	"log"
	"net/url"
	"time"

	"github.com/brianvoe/gofakeit/v7"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type productInfo struct {
	ID   int64
	Name string
}

func main() {
	// 1. Setup environment and DB
	_ = godotenv.Load()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := database.Connect(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	queries := sqlc.New(pool)

	// 2. Initialize Repositories
	userRepo := repositories.NewPostgresUserRepo(queries)
	productRepo := repositories.NewPostgresProductRepo(queries)
	catRepo := repositories.NewPostgresProductCategoryRepo(queries)
	imgRepo := repositories.NewPostgresProductImageRepo(queries)
	mappingRepo := repositories.NewPostgresProductCategoryMappingRepo(queries)

	// 2.2 Run migrations to ensure schema is up to date with defaults
	if err := database.Migrate(ctx); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// 2.5 Clean existing data
	cleanDatabase(ctx, pool)

	fmt.Println("🌱 Seeding database...")

	// 3. Seed Users
	seedUsers(ctx, userRepo, 1000)

	// 4. Seed Categories and capture IDs
	categoryIDs := seedCategories(ctx, catRepo)

	// 5. Seed Products and capture IDs
	products := seedProducts(ctx, productRepo, 1000)

	// 6. Seed Product Images
	seedProductImages(ctx, imgRepo, products)

	// 7. Map Products to Categories
	seedProductCategoryMappings(ctx, mappingRepo, products, categoryIDs)

	fmt.Println("✅ Seeding completed successfully!")
}

func cleanDatabase(ctx context.Context, pool interface {
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
}) {
	fmt.Println("🧹 Cleaning database...")
	_, err := pool.Exec(ctx, "TRUNCATE TABLE users, products, product_categories, product_images, product_category_mapping RESTART IDENTITY CASCADE")
	if err != nil {
		log.Printf("   Warning: Failed to clean database: %v", err)
	}
}

func seedUsers(ctx context.Context, repo interface {
	CreateUser(ctx context.Context, name, email, password string) (*models.UserResponse, error)
}, count int) {
	fmt.Printf("-> Creating %d users...\n", count)

	text := "password123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(text), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("   Failed to hash password for user %s: %v", err)
	}

	for i := 0; i < count; i++ {
		name := gofakeit.Name()
		email := gofakeit.Email()
		password := hashedPassword // Using a fixed password for easy testing after seeding

		if _, err = repo.CreateUser(ctx, name, email, string(password)); err != nil {
			log.Printf("   Error creating user %s: %v", email, err)
		}
	}
}

func seedProducts(ctx context.Context, repo interface {
	CreateProduct(ctx context.Context, req models.CreateProductRequest) (*models.ProductResponse, error)
}, count int) []productInfo {
	fmt.Printf("-> Creating %d products...\n", count)
	var products []productInfo
	for i := 0; i < count; i++ {
		req := models.CreateProductRequest{
			Name:        gofakeit.ProductName(),
			Description: gofakeit.ProductDescription(),
			Price:       gofakeit.Price(10, 1000),
			Rating:      int16(gofakeit.Number(1, 5)),
			InStock:     gofakeit.Bool(),
		}

		res, err := repo.CreateProduct(ctx, req)
		if err == nil {
			products = append(products, productInfo{
				ID:   res.ID,
				Name: res.Name,
			})
		} else {
			log.Printf("   Error creating product %s: %v", req.Name, err)
		}
	}
	return products
}

func seedCategories(ctx context.Context, repo interface {
	CreateProductCategory(ctx context.Context, req models.CreateProductCategoryRequest) (*models.ProductCategoryResponse, error)
}) []int32 {
	// Using fixed names for better testing of filters later
	categoryNames := []string{"Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty", "Sports", "Toys", "Automotive"}
	fmt.Printf("-> Creating %d categories...\n", len(categoryNames))

	var ids []int32
	for _, name := range categoryNames {
		res, err := repo.CreateProductCategory(ctx, models.CreateProductCategoryRequest{Name: name})
		if err == nil {
			ids = append(ids, int32(res.ID))
		} else {
			log.Printf("   Error creating category %s: %v", name, err)
		}
	}
	return ids
}

func seedProductImages(ctx context.Context, repo interface {
	CreateProductImage(ctx context.Context, req models.CreateProductImageRequest) (*models.ProductImageResponse, error)
}, products []productInfo) {
	fmt.Printf("-> Creating images for %d products...\n", len(products))
	for _, p := range products {
		// Assign 1 to 3 images to each product
		numImages := gofakeit.Number(1, 3)
		for i := 1; i <= numImages; i++ {
			// Construct the text parameter: Product Name + Newline + Image Order (01, 02...)
			text := fmt.Sprintf("%s\n%02d", p.Name, i)
			imageURL := fmt.Sprintf("https://placehold.co/600x400/EEE/31343C?font=playfair-display&text=%s", url.QueryEscape(text))

			_, err := repo.CreateProductImage(ctx, models.CreateProductImageRequest{
				ProductID: p.ID,
				ImageURL:  imageURL,
			})

			if err != nil {
				log.Printf("   Error creating image for product %d: %v", p.ID, err)
			}
		}
	}
}

func seedProductCategoryMappings(ctx context.Context, repo interface {
	CreateProductCategoryMapping(ctx context.Context, req models.CreateProductCategoryMappingRequest) (*models.ProductCategoryMappingResponse, error)
}, products []productInfo, categoryIDs []int32) {
	if len(categoryIDs) == 0 {
		return
	}

	fmt.Printf("-> Mapping products to categories...\n")
	for _, p := range products {
		// Assign 1 to 3 random categories to each product
		numCategories := gofakeit.Number(1, 3)

		// Shuffle or pick random indices
		indices := gofakeit.RandomInt([]int{0, len(categoryIDs) - 1})
		_ = indices // Placeholder logic for randomization

		selected := make(map[int32]bool)
		for j := 0; j < numCategories; j++ {
			catID := categoryIDs[gofakeit.Number(0, len(categoryIDs)-1)]

			// Prevent duplicate mapping for the same product-category pair
			if selected[catID] {
				continue
			}
			selected[catID] = true

			_, err := repo.CreateProductCategoryMapping(ctx, models.CreateProductCategoryMappingRequest{
				ProductID:  p.ID,
				CategoryID: catID,
			})
			if err != nil {
				log.Printf("   Error mapping product %d to category %d: %v", p.ID, catID, err)
			}
		}
	}
}
