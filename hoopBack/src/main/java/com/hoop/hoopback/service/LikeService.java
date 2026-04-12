package com.hoop.hoopback.service;

import com.hoop.hoopback.entity.Like;
import com.hoop.hoopback.entity.Post;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.ResourceNotFoundException;
import com.hoop.hoopback.repository.LikeRepository;
import com.hoop.hoopback.repository.PostRepository;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void likePost(String username, Long postId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Пост не найден"));

        if (likeRepository.existsByUserAndPost(user, post)) {
            return;
        }

        Like like = Like.builder()
                .user(user)
                .post(post)
                .build();

        likeRepository.save(like);

        eventPublisher.publishEvent(new com.hoop.hoopback.event.PostLikedEvent(this, user, post.getAuthor(), post.getId()));
    }

    @Transactional
    public void unlikePost(String username, Long postId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Пост не найден"));

        likeRepository.findByUserAndPost(user, post)
                .ifPresent(likeRepository::delete);
    }
}
