package repositories

import (
	sqlc "assignment-be/database/sqlc"
	"assignment-be/models"
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type postgresUserRepo struct {
	queries *sqlc.Queries
}

func NewPostgresUserRepo(q *sqlc.Queries) *postgresUserRepo {
	return &postgresUserRepo{queries: q}
}

func (r *postgresUserRepo) CreateUser(ctx context.Context, name, email, password string) (*models.UserResponse, error) {
	u, err := r.queries.CreateUser(ctx, sqlc.CreateUserParams{Name: name, Email: email, Password: password})
	if err != nil {
		return nil, err
	}
	return &models.UserResponse{ID: u.ID, Name: u.Name, Email: u.Email}, nil
}

func (r *postgresUserRepo) GetUserByEmail(ctx context.Context, email string) (*models.UserResponse, string, error) {
	u, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, "", err
	}
	return &models.UserResponse{ID: u.ID, Name: u.Name, Email: u.Email}, u.Password, nil
}

func (r *postgresUserRepo) GetUserByGoogleID(ctx context.Context, googleID string) (*models.UserResponse, error) {
	u, err := r.queries.GetUserByGoogleID(ctx, pgtype.Text{String: googleID, Valid: true})
	if err != nil {
		return nil, err
	}
	return &models.UserResponse{ID: u.ID, Name: u.Name, Email: u.Email}, nil
}

func (r *postgresUserRepo) CreateUserWithGoogle(ctx context.Context, name, email, password, googleID string) (*models.UserResponse, error) {
	u, err := r.queries.CreateUserWithGoogle(ctx, sqlc.CreateUserWithGoogleParams{
		Name:     name,
		Email:    email,
		Password: password,
		GoogleID: pgtype.Text{String: googleID, Valid: true},
	})
	if err != nil {
		return nil, err
	}
	return &models.UserResponse{ID: u.ID, Name: u.Name, Email: u.Email}, nil
}

func (r *postgresUserRepo) ListUsers(ctx context.Context) ([]models.UserResponse, error) {
	users, err := r.queries.ListUsers(ctx)
	if err != nil {
		return nil, err
	}
	res := make([]models.UserResponse, 0, len(users))
	for _, u := range users {
		res = append(res, models.UserResponse{ID: u.ID, Name: u.Name, Email: u.Email})
	}
	return res, nil
}
