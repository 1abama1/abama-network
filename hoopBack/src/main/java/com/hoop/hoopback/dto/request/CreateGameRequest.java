package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record CreateGameRequest(
    @NotBlank
    @Size(max = 255)
    String title,

    @Size(max = 1000)
    String description,

    @NotBlank
    String location,

    @NotNull
    @Future
    LocalDateTime dateTime,

    @Min(2)
    Integer minPlayers,

    @Min(2)
    Integer maxPlayers
) {}
