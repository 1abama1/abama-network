package com.hoop.hoopback.mapper;

import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.User;
import org.springframework.stereotype.Component;

import java.util.HashSet;

@Component
public class UserMapper {

    public UserSummaryDto toSummaryDto(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getPositions() != null ? new HashSet<>(user.getPositions()) : null,
                user.getHeight(),
                user.getFollowersCount() != null ? user.getFollowersCount() : 0,
                user.getBio());
    }
}
