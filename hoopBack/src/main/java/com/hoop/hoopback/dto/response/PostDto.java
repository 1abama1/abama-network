package com.hoop.hoopback.dto.response;

import java.time.LocalDateTime;

public record PostDto(
    Long id,
    UserSummaryDto author,
    String content,
    LocalDateTime createdAt,
    long likesCount,
    long commentsCount,
    long repostsCount,
    boolean isLiked,
    boolean isReposted,
    PostDto originalPost, // For reposts
    String repostCaption // For quote-reposts
) {}
