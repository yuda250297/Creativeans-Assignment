-- name: GetProductImage :one
SELECT * FROM product_images
WHERE id = $1 LIMIT 1;

-- name: ListProductImages :many
SELECT * FROM product_images;

-- name: CreateProductImage :one
INSERT INTO product_images (
  product_id, image_url
) VALUES (
  $1, $2
)
RETURNING *;

-- name: DeleteProductImage :exec
DELETE FROM product_images
WHERE id = $1;