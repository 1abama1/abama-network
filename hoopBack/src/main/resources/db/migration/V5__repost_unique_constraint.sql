-- V5__repost_unique_constraint.sql
-- Prevent duplicate reposts by adding a unique constraint
-- and an index for performance on existence checks.

ALTER TABLE reposts 
ADD CONSTRAINT unique_user_original_post 
UNIQUE (user_id, original_post_id);

CREATE INDEX IF NOT EXISTS idx_reposts_user_original 
ON reposts(user_id, original_post_id);
