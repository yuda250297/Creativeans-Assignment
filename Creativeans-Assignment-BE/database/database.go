package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

// Connect initializes a connection pool to PostgreSQL using the DATABASE_URL environment variable.
func Connect(ctx context.Context) (*pgxpool.Pool, error) {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return pool, nil
}

// Migrate runs database migrations using goose.
func Migrate(ctx context.Context) error {
	// goose requires a *sql.DB, we create a temporary connection for migrations
	connStr := os.Getenv("DATABASE_URL")
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		return fmt.Errorf("failed to open sql db for migrations: %w", err)
	}
	defer db.Close()

	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}

	if err := goose.Up(db, "database/migrations"); err != nil {
		return fmt.Errorf("goose up failed: %w", err)
	}
	return nil
}
