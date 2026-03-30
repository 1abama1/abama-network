package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.Size;

public record RepostRequest(
    @Size(max = 500)
    String caption // For quote-reposts
) {}
