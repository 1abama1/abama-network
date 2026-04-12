package com.hoop.hoopback.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Like> likes = new ArrayList<>();

    @OneToMany(mappedBy = "originalPost", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Repost> reposts = new ArrayList<>();

    @org.hibernate.annotations.Formula("(SELECT COALESCE(COUNT(l.id), 0) FROM likes l WHERE l.post_id = id)")
    private Long likesCount;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(COUNT(c.id), 0) FROM comments c WHERE c.post_id = id)")
    private Long commentsCount;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(COUNT(r.id), 0) FROM reposts r WHERE r.original_post_id = id)")
    private Long repostsCount;

    public boolean isOwnedBy(String username) {
        return author != null && author.getUsername().equals(username);
    }
}
