package com.hoop.hoopback.controller;

import com.hoop.hoopback.dto.response.UnifiedSearchResponse;
import com.hoop.hoopback.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/top")
    public ResponseEntity<UnifiedSearchResponse> getTopResults(
            @RequestParam String q,
            Authentication authentication
    ) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(searchService.searchTop(q, currentUsername));
    }
}
