package com.hoop.hoopback.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedSearchResponse {
    private List<UserSummaryDto> users;
    private List<PostDto> posts;
    private List<GameDto> games;
}
