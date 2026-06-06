-- name: GetProductCategoryMapping :one
SELECT * FROM product_category_mapping
WHERE product_id = $1 AND category_id = $2 LIMIT 1;

-- name: ListProductCategoryMappings :many
SELECT * FROM product_category_mapping;

-- name: CreateProductCategoryMapping :one
INSERT INTO product_category_mapping (
  product_id, category_id
) VALUES (
  $1, $2
)
RETURNING *;

-- name: DeleteProductCategoryMapping :exec
DELETE FROM product_category_mapping
WHERE product_id = $1 AND category_id = $2;