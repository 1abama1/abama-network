package com.hoop.hoopback.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean isEnabled = true;

    private String bio;

    private Double height;

    private Double weight;

    private Double jump;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_positions", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.BatchSize(size = 50)
    private Set<Position> positions;

    @ManyToMany
    @JoinTable(
            name = "user_followers",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    @Builder.Default
    @org.hibernate.annotations.BatchSize(size = 50)
    private Set<User> followers = new HashSet<>();

    @ManyToMany(mappedBy = "followers")
    @Builder.Default
    @org.hibernate.annotations.BatchSize(size = 50)
    private Set<User> following = new HashSet<>();

    @org.hibernate.annotations.Formula("(SELECT count(1) FROM user_followers uf WHERE uf.user_id = id)")
    private Integer followersCount;

    @org.hibernate.annotations.Formula("(SELECT count(1) FROM user_followers uf WHERE uf.follower_id = id)")
    private Integer followingCount;

    public void follow(User target) {
        target.getFollowers().add(this);
    }

    public void unfollow(User target) {
        target.getFollowers().remove(this);
    }

    public boolean isFollowing(User target) {
        return followers.contains(target);
    }
}
