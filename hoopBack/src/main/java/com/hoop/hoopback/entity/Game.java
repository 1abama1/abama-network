package com.hoop.hoopback.entity;

import com.hoop.hoopback.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Builder.Default
    private Integer minPlayers = 2;

    @Builder.Default
    private Integer maxPlayers = 10;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameRegistration> registrations = new ArrayList<>();

    public boolean isFull() {
        return registrations.size() >= maxPlayers;
    }

    public boolean hasPlayer(User user) {
        return registrations.stream().anyMatch(r -> r.getUser().getId().equals(user.getId()));
    }

    public boolean isOwnedBy(String username) {
        return creator != null && creator.getUsername().equals(username);
    }
}
