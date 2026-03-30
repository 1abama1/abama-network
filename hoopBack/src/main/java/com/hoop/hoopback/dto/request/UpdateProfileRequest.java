package com.hoop.hoopback.dto.request;

import com.hoop.hoopback.entity.Position;
import jakarta.validation.constraints.*;
import java.util.Set;

public record UpdateProfileRequest(
    @Size(max = 500)
    String bio,

    @DecimalMin("140.0")
    @DecimalMax("250.0")
    @NotNull
    Double height,

    @DecimalMin("40.0")
    @DecimalMax("200.0")
    @NotNull
    Double weight,

    @DecimalMin("0.0")
    @DecimalMax("150.0")
    @NotNull
    Double jump,

    @NotEmpty
    Set<Position> positions
) {}
