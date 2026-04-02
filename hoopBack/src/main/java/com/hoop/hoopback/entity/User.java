package com.hoop.hoopback.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

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
    private boolean isEnabled = false;

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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }
}
