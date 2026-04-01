-- V3__fix_messages_and_notifications.sql

-- Drop the correct table if V2 missed it due to typo
DROP TABLE IF EXISTS otp_tokens;

-- Safe rename for recipient_id to receiver_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'recipient_id'
    ) THEN
        ALTER TABLE messages RENAME COLUMN recipient_id TO receiver_id;
    END IF;
END $$;

-- Safe rename for created_at to sent_at
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE messages RENAME COLUMN created_at TO sent_at;
    END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    entity_type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, sent_at DESC);
