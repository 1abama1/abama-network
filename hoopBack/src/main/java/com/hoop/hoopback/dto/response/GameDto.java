package com.hoop.hoopback.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record GameDto(
    Long id,
    UserSummaryDto creator,
    String title,
    String description,
    String location,
    LocalDateTime dateTime,
    Integer minPlayers,
    Integer maxPlayers,
    int playersCount,
    List<UserSummaryDto> players,
    boolean isRegistered
) {}
