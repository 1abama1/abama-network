package com.hoop.hoopback.dto.response;

import com.hoop.hoopback.entity.Position;
import java.util.Set;

public record UserSummaryDto(
    Long id,
    String username,
    Set<Position> positions,
    Double height,
    long followersCount
) {}
