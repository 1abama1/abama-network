package com.hoop.hoopback.event;

import com.hoop.hoopback.entity.NotificationType;
import com.hoop.hoopback.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    @Async
    @EventListener
    public void onPostLiked(PostLikedEvent event) {
        notificationService.notify(
                event.getPostAuthor(), event.getActor(),
                NotificationType.LIKE, event.getPostId(), "POST");
    }

    @Async
    @EventListener
    public void onCommentAdded(CommentAddedEvent event) {
        notificationService.notify(
                event.getPostAuthor(), event.getActor(),
                NotificationType.COMMENT, event.getPostId(), "POST");
    }

    @Async
    @EventListener
    public void onUserFollowed(UserFollowedEvent event) {
        notificationService.notify(
                event.getTarget(), event.getFollower(),
                NotificationType.FOLLOW, event.getTargetId(), "USER");
    }

    @Async
    @EventListener
    public void onGameRegistered(GameRegisteredEvent event) {
        notificationService.notify(
                event.getGameCreator(), event.getPlayer(),
                NotificationType.GAME_JOIN, event.getGameId(), "GAME");
    }

    @Async
    @EventListener
    public void onPostReposted(PostRepostedEvent event) {
        notificationService.notify(
                event.getPostAuthor(), event.getActor(),
                NotificationType.REPOST, event.getPostId(), "POST");
    }
}
