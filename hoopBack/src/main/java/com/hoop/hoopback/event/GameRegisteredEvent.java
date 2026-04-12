package com.hoop.hoopback.event;

import com.hoop.hoopback.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class GameRegisteredEvent extends ApplicationEvent {
    private final User player;
    private final User gameCreator;
    private final Long gameId;

    public GameRegisteredEvent(Object source, User player, User gameCreator, Long gameId) {
        super(source);
        this.player = player;
        this.gameCreator = gameCreator;
        this.gameId = gameId;
    }
}
