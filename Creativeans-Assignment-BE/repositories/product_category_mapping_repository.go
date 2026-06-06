package repositories

import (
	sqlc "assignment-be/database/sqlc"
	"assignment-be/models"
	"context"
)

type postgresProductCategoryMappingRepo struct {
	queries *sqlc.Queries
}

func NewPostgresProductCategoryMappingRepo(q *sqlc.Queries) *postgresProductCategoryMappingRepo {
	return &postgresProductCategoryMappingRepo{queries: q}
}

func (r *postgresProductCategoryMappingRepo) CreateProductCategoryMapping(ctx context.Context, req models.CreateProductCategoryMappingRequest) (*models.ProductCategoryMappingResponse, error) {
	p, err := r.queries.CreateProductCategoryMapping(ctx, sqlc.CreateProductCategoryMappingParams{
		ProductID:  req.ProductID,
		CategoryID: req.CategoryID,
	})
	if err != nil {
		return nil, err
	}

	return r.mapProductCategoryMappingToResponse(p), nil
}

// mapProductCategoryMappingToResponse is a private helper to convert DB model to API response.
func (r *postgresProductCategoryMappingRepo) mapProductCategoryMappingToResponse(p sqlc.ProductCategoryMapping) *models.ProductCategoryMappingResponse {

	createdAt := ""
	if p.CreatedAt.Valid {
		createdAt = p.CreatedAt.Time.Format("2006-01-02 15:04:05")
	}

	return &models.ProductCategoryMappingResponse{
		ProductID:  p.ProductID,
		CategoryID: p.CategoryID,
		CreatedAt:  createdAt,
	}
}
