package services

import (
	"assignment-be/helpers"
	"assignment-be/models"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// UserRepository defines the data access contract for users.
type UserRepository interface {
	CreateUser(ctx context.Context, name, email, password string) (*models.UserResponse, error)
	GetUserByEmail(ctx context.Context, email string) (*models.UserResponse, string, error) // Returns user + hashed password
	GetUserByGoogleID(ctx context.Context, googleID string) (*models.UserResponse, error)
	CreateUserWithGoogle(ctx context.Context, name, email, password, googleID string) (*models.UserResponse, error)
	ListUsers(ctx context.Context) ([]models.UserResponse, error)
}

// UserService defines the interface for user-related business logic.
type UserService interface {
	CreateUser(ctx context.Context, req models.CreateUserRequest) (*models.UserResponse, error)
	Login(ctx context.Context, req models.LoginRequest) (*models.AuthResponse, error)
	GetGoogleLoginURL() string
	HandleGoogleCallback(ctx context.Context, code string) (*models.AuthResponse, error)
	ListUsers(ctx context.Context) ([]models.UserResponse, error)
}

// userService implements the UserService interface.
type userService struct {
	repo UserRepository
}

// NewService creates a new user service.
func NewUserService(repo UserRepository) UserService {
	return &userService{
		repo: repo,
	}
}

// CreateUser implements the Service interface for creating a user.
func (s *userService) CreateUser(ctx context.Context, req models.CreateUserRequest) (*models.UserResponse, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	return s.repo.CreateUser(ctx, req.Name, req.Email, string(hashedPassword))
}

// Login verifies credentials and returns a JWT token.
func (s *userService) Login(ctx context.Context, req models.LoginRequest) (*models.AuthResponse, error) {
	user, hashedPassword, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_secret_change_me"
	}

	t, err := token.SignedString([]byte(secret))
	if err != nil {
		return nil, fmt.Errorf("failed to sign token: %w", err)
	}

	return &models.AuthResponse{
		Token: t,
		User: models.UserResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
		},
	}, nil
}

// GetGoogleLoginURL returns the URL for Google OAuth login.
func (s *userService) GetGoogleLoginURL() string {
	return helpers.GetGoogleOAuthConfig().AuthCodeURL("state-token")
}

// HandleGoogleCallback exchanges code for user info and generates a JWT.
func (s *userService) HandleGoogleCallback(ctx context.Context, code string) (*models.AuthResponse, error) {
	conf := helpers.GetGoogleOAuthConfig()
	token, err := conf.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %w", err)
	}

	client := conf.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %w", err)
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return nil, err
	}

	// 1. Try to find by Google ID
	user, err := s.repo.GetUserByGoogleID(ctx, googleUser.ID)
	if err != nil {
		// 2. Fallback: try to find by Email to link accounts
		user, _, err = s.repo.GetUserByEmail(ctx, googleUser.Email)
		if err != nil {
			// 3. Create new user if they don't exist
			password := "oauth_managed_" + googleUser.ID
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
			if err != nil {
				return nil, fmt.Errorf("failed to hash password: %w", err)
			}
			user, err = s.repo.CreateUserWithGoogle(ctx, googleUser.Name, googleUser.Email, string(hashedPassword), googleUser.ID)
			if err != nil {
				return nil, err
			}
		}
	}

	// Generate JWT
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_secret_change_me"
	}

	t, err := jwtToken.SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		Token: t,
		User: models.UserResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
		},
	}, nil
}

// ListUsers implements the Service interface for listing all users.
func (s *userService) ListUsers(ctx context.Context) ([]models.UserResponse, error) {
	return s.repo.ListUsers(ctx)
}
