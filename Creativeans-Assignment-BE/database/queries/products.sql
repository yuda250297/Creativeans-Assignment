-- name: GetProductDetails :one
SELECT 
    p.id, p.name, p.description, p.price, p.rating, p.instock, p.created_at, p.updated_at,
    COALESCE(
        (
            SELECT json_agg(json_build_object('id', pc.id, 'name', pc.name, 'created_at', pc.created_at))
            FROM product_category_mapping m
            JOIN product_categories pc ON m.category_id = pc.id
            WHERE m.product_id = p.id
        ),
        '[]'
    )::json as categories,
    COALESCE(
        (
            SELECT json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'created_at', pi.created_at))
            FROM product_images pi
            WHERE pi.product_id = p.id
        ),
        '[]'
    )::json as product_images
FROM products p
WHERE p.id = $1;

-- name: ListProducts :many
SELECT 
    p.id, p.name, p.description, p.price, p.rating, p.instock, p.created_at, p.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', pc.id,
                'name', pc.name,
                'created_at', pc.created_at
            )
        ) FILTER (WHERE pc.id IS NOT NULL), 
        '[]'
    )::json as categories
FROM products p
LEFT JOIN product_category_mapping m ON p.id = m.product_id
LEFT JOIN product_categories pc ON m.category_id = pc.id
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id
ORDER BY p.created_at DESC;

-- name: ListProductsFiltered :many
SELECT 
    p.id, p.name, p.description, p.price, p.rating, p.instock, p.created_at, p.updated_at, COUNT(*) OVER() as total_count,
    COALESCE(
        json_agg(
            json_build_object(
                'id', pc.id,
                'name', pc.name,
                'created_at', pc.created_at
            )
        ) FILTER (WHERE pc.id IS NOT NULL), 
        '[]'
    )::json as categories,
        COALESCE(
        json_agg(
            json_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'created_at', pi.created_at
            )
        ) FILTER (WHERE pi.id IS NOT NULL), 
        '[]'
    )::json as product_images
FROM products p
LEFT JOIN product_category_mapping m ON p.id = m.product_id
LEFT JOIN product_categories pc ON m.category_id = pc.id
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE 
    (
        sqlc.arg('q')::text = '' 
        OR (
            websearch_to_tsquery('english', sqlc.arg('q')::text) <> ''::tsquery
            AND p.search_vector @@ websearch_to_tsquery('english', sqlc.arg('q')::text)
        )
        OR p.name % sqlc.arg('q')::text  -- trigram similarity
        OR p.name ILIKE '%' || sqlc.arg('q')::text || '%'  -- partial match
    )
    AND (sqlc.narg('category_ids')::int[] IS NULL OR cardinality(sqlc.narg('category_ids')::int[]) = 0 OR m.category_id = ANY(sqlc.narg('category_ids')))
    AND (sqlc.narg('min_price')::numeric IS NULL OR p.price >= sqlc.narg('min_price'))
    AND (sqlc.narg('max_price')::numeric IS NULL OR p.price <= sqlc.narg('max_price'))
    AND (sqlc.narg('in_stock')::boolean IS NULL OR p.instock = sqlc.narg('in_stock'))
GROUP BY p.id
ORDER BY
    CASE WHEN sqlc.arg('sort')::text = 'relevance' AND sqlc.arg('q')::text <> '' THEN ts_rank(p.search_vector, websearch_to_tsquery('english', sqlc.arg('q')::text)) END DESC,
    CASE WHEN sqlc.arg('sort')::text = 'price' AND sqlc.arg('method')::text = 'asc' THEN p.price END ASC,
    CASE WHEN sqlc.arg('sort')::text = 'price' AND sqlc.arg('method')::text = 'desc' THEN p.price END DESC,
    CASE WHEN sqlc.arg('sort')::text = 'rating' THEN p.rating END DESC,
    CASE WHEN sqlc.arg('sort')::text = 'created_at' AND sqlc.arg('method')::text = 'asc' THEN p.created_at END ASC,
    CASE WHEN sqlc.arg('sort')::text = 'created_at' AND sqlc.arg('method')::text <> 'asc' THEN p.created_at END DESC,
    p.created_at DESC
LIMIT sqlc.arg('limit')::int OFFSET sqlc.arg('offset')::int;

-- name: CreateProduct :one
INSERT INTO products (
  name, description, price, rating, inStock
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: DeleteProduct :exec
DELETE FROM products
WHERE id = $1;
