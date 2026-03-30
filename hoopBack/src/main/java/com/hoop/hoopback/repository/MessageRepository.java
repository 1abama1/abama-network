package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.Message;
import com.hoop.hoopback.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE (m.sender = :u1 AND m.receiver = :u2) OR (m.sender = :u2 AND m.receiver = :u1) ORDER BY m.sentAt DESC")
    Page<Message> findConversation(User u1, User u2, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.id IN (SELECT MAX(m2.id) FROM Message m2 WHERE m2.sender = :user OR m2.receiver = :user GROUP BY CASE WHEN m2.sender = :user THEN m2.receiver.id ELSE m2.sender.id END) ORDER BY m.sentAt DESC")
    List<Message> findLatestMessagesPerContact(User user);
}
