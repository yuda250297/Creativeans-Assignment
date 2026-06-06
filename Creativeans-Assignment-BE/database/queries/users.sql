-- name: GetUser :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY name;

-- name: CreateUser :one
INSERT INTO users (
  name, email, password
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: GetUserByGoogleID :one
SELECT * FROM users
WHERE google_id = $1 LIMIT 1;

-- name: CreateUserWithGoogle :one
INSERT INTO users (
  name, email, password, google_id
) VALUES (
  $1, $2, $3, $4
) RETURNING *;