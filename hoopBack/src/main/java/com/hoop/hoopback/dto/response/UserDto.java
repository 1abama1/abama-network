package com.hoop.hoopback.dto.response;

import com.hoop.hoopback.entity.Position;
import java.util.Set;

public record UserDto(
    Long id,
    String username,
    String email,
    String bio,
    Double height,
    Double weight,
    Double jump,
    Set<Position> positions,
    long followersCount,
    long followingCount,
    boolean isFollowing
) {}
