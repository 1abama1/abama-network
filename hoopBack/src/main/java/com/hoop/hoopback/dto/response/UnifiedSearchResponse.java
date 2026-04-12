package com.hoop.hoopback.dto.response;

import java.util.List;

public record UnifiedSearchResponse(
        List<UserSummaryDto> users,
        List<PostDto> posts,
        List<GameDto> games
) {}
