package repositories

import (
	sqlc "assignment-be/database/sqlc"
	"assignment-be/models"
	"context"
)

type postgresProductCategoryRepo struct {
	queries *sqlc.Queries
}

func NewPostgresProductCategoryRepo(q *sqlc.Queries) *postgresProductCategoryRepo {
	return &postgresProductCategoryRepo{queries: q}
}

func (r *postgresProductCategoryRepo) CreateProductCategory(ctx context.Context, req models.CreateProductCategoryRequest) (*models.ProductCategoryResponse, error) {
	p, err := r.queries.CreateProductCategory(ctx, req.Name)
	if err != nil {
		return nil, err
	}

	return r.mapProductCategoryToResponse(p), nil
}

func (r *postgresProductCategoryRepo) ListProductCategories(ctx context.Context) ([]models.ProductCategoryResponse, error) {
	products, err := r.queries.ListProductCategories(ctx)
	if err != nil {
		return nil, err
	}
	res := make([]models.ProductCategoryResponse, 0, len(products))
	for _, p := range products {
		res = append(res, *r.mapProductCategoryToResponse(p))
	}
	return res, nil
}

// mapProductCategoryToResponse is a private helper to convert DB model to API response.
func (r *postgresProductCategoryRepo) mapProductCategoryToResponse(p sqlc.ProductCategory) *models.ProductCategoryResponse {

	createdAt := ""
	if p.CreatedAt.Valid {
		createdAt = p.CreatedAt.Time.Format("2006-01-02 15:04:05")
	}

	return &models.ProductCategoryResponse{
		ID:        p.ID,
		Name:      p.Name,
		CreatedAt: createdAt,
	}
}
