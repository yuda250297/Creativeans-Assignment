package repositories

import (
	sqlc "assignment-be/database/sqlc"
	"assignment-be/models"
	"context"
)

type postgresProductImageRepo struct {
	queries *sqlc.Queries
}

func NewPostgresProductImageRepo(q *sqlc.Queries) *postgresProductImageRepo {
	return &postgresProductImageRepo{queries: q}
}

func (r *postgresProductImageRepo) CreateProductImage(ctx context.Context, req models.CreateProductImageRequest) (*models.ProductImageResponse, error) {
	p, err := r.queries.CreateProductImage(ctx, sqlc.CreateProductImageParams{
		ProductID: int32(req.ProductID),
		ImageUrl:  req.ImageURL,
	})
	if err != nil {
		return nil, err
	}

	return r.mapProductImageToResponse(p), nil
}

// mapProductImageToResponse is a private helper to convert DB model to API response.
func (r *postgresProductImageRepo) mapProductImageToResponse(p sqlc.ProductImage) *models.ProductImageResponse {

	createdAt := ""
	if p.CreatedAt.Valid {
		createdAt = p.CreatedAt.Time.Format("2006-01-02 15:04:05")
	}

	return &models.ProductImageResponse{
		ID:        p.ID,
		ImageURL:  p.ImageUrl,
		CreatedAt: createdAt,
	}
}
