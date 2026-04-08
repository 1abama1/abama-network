-- V5__repost_unique_constraint.sql
-- Prevent duplicate reposts by adding a unique constraint
-- and an index for performance on existence checks.

-- First, delete any existing duplicate reposts to prevent constraint violation
-- This keeps the oldest repost for a given user and post, and deletes the rest
DELETE FROM reposts a USING reposts b
  WHERE a.id > b.id 
    AND a.user_id = b.user_id 
    AND a.original_post_id = b.original_post_id;

ALTER TABLE reposts 
ADD CONSTRAINT unique_user_original_post 
UNIQUE (user_id, original_post_id);

CREATE INDEX IF NOT EXISTS idx_reposts_user_original 
ON reposts(user_id, original_post_id);
