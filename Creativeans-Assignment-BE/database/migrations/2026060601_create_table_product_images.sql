-- +goose Up
CREATE TABLE IF NOT EXISTS product_images (
  id          BIGSERIAL PRIMARY KEY,
  product_id  INT NOT NULL,
  image_url   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster joins
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- +goose Down
DROP TABLE IF EXISTS product_images;