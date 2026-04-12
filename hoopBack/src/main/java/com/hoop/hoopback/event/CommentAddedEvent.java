package com.hoop.hoopback.event;

import com.hoop.hoopback.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentAddedEvent extends ApplicationEvent {
    private final User actor;
    private final User postAuthor;
    private final Long postId;

    public CommentAddedEvent(Object source, User actor, User postAuthor, Long postId) {
        super(source);
        this.actor = actor;
        this.postAuthor = postAuthor;
        this.postId = postId;
    }
}
