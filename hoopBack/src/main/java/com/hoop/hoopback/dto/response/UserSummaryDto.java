package com.hoop.hoopback.dto.response;

public record UserSummaryDto(
        Long id,
        String username,
        java.util.Set<com.hoop.hoopback.entity.Position> positions,
        Double height,
        long followersCount) implements java.io.Serializable {
}
