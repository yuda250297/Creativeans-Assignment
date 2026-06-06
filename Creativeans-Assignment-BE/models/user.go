package models

// CreateUserRequest defines the structure for creating a new user.
type CreateUserRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// LoginRequest defines the structure for user login.
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// UserResponse defines the structure for a user in API responses.
type UserResponse struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// UsersResponse defines the structure for a list of users in API responses.
type UsersResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Data    []UserResponse `json:"data"`
}

// AuthResponse defines the structure for login response.
type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}
