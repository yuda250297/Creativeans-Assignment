-- Add the generated column
-- +goose Up
ALTER TABLE products 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
) STORED;

-- New index on the column (much simpler for planner to pick up)
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);

-- ensure pg_trgm extension is available for trigram indexing
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);

-- +goose Down
DROP INDEX IF EXISTS idx_products_search_vector;
DROP INDEX IF EXISTS idx_products_name_trgm;
DROP INDEX IF EXISTS idx_products_search_fts;
ALTER TABLE products DROP COLUMN search_vector;
