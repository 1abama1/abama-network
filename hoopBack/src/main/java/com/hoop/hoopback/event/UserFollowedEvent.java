package com.hoop.hoopback.event;

import com.hoop.hoopback.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserFollowedEvent extends ApplicationEvent {
    private final User follower;
    private final User target;
    private final Long targetId;

    public UserFollowedEvent(Object source, User follower, User target, Long targetId) {
        super(source);
        this.follower = follower;
        this.target = target;
        this.targetId = targetId;
    }
}
