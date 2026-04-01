-- V4: Messenger schema redesign
-- conversations: каждая пара пользователей имеет одну запись
CREATE TABLE IF NOT EXISTS conversations (
    id          BIGSERIAL PRIMARY KEY,
    user_a_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Уникальный индекс на пару пользователей (независимо от порядка)
-- В PostgreSQL обычный UNIQUE constraint не поддерживает функции (LEAST/GREATEST).
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversation_pair 
ON conversations (LEAST(user_a_id, user_b_id), GREATEST(user_a_id, user_b_id));

CREATE INDEX IF NOT EXISTS idx_conv_user_a ON conversations(user_a_id);
CREATE INDEX IF NOT EXISTS idx_conv_user_b ON conversations(user_b_id);

-- Добавляем поле receiver_id корректно (в V1 было recipient_id — ошибка)
-- Полностью пересоздаём таблицу messages
DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    sent_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at         TIMESTAMP WITH TIME ZONE,
    deleted_at      TIMESTAMP WITH TIME ZONE  -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_msg_conv_sent
    ON messages(conversation_id, sent_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);
