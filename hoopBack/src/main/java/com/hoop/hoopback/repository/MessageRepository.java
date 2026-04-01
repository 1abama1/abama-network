package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.Conversation;
import com.hoop.hoopback.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /** Cursor-based pagination: берём сообщения старше курсора (before) */
    @Query("""
                SELECT m FROM Message m
                WHERE m.conversation = :conv
                  AND m.deletedAt IS NULL
                  AND (:before IS NULL OR m.sentAt < :before)
                ORDER BY m.sentAt DESC
            """)
    List<Message> findByConversationBefore(
            @Param("conv") Conversation conv,
            @Param("before") Instant before,
            Pageable pageable);

    /** Последнее сообщение в диалоге (для превью) */
    @Query("""
                SELECT m FROM Message m
                WHERE m.conversation = :conv AND m.deletedAt IS NULL
                ORDER BY m.sentAt DESC
                LIMIT 1
            """)
    Optional<Message> findLastByConversation(@Param("conv") Conversation conv);

    /** Кол-во непрочитанных для конкретного получателя */
    @Query("""
                SELECT COUNT(m) FROM Message m
                WHERE m.conversation = :conv
                  AND m.sender != :reader
                  AND m.readAt IS NULL
                  AND m.deletedAt IS NULL
            """)
    long countUnread(
            @Param("conv") Conversation conv,
            @Param("reader") com.hoop.hoopback.entity.User reader);

    /** Массово отмечаем прочитанными все входящие в диалоге */
    @Modifying
    @Query("""
                UPDATE Message m
                SET m.readAt = :now
                WHERE m.conversation = :conv
                  AND m.sender != :reader
                  AND m.readAt IS NULL
                  AND m.deletedAt IS NULL
            """)
    int markAllRead(
            @Param("conv") Conversation conv,
            @Param("reader") com.hoop.hoopback.entity.User reader,
            @Param("now") Instant now);
}
