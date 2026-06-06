-- +goose Up
CREATE TABLE IF NOT EXISTS product_category_mapping (
  product_id  BIGINT NOT NULL REFERENCES products(id),
  category_id INT NOT NULL REFERENCES product_categories(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, category_id)
);

-- Index for faster joins
CREATE INDEX idx_mapping_category ON product_category_mapping(category_id);

-- +goose Down
DROP INDEX IF EXISTS idx_mapping_category;
DROP TABLE IF EXISTS product_category_mapping;