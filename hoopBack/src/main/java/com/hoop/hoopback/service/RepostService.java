package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.RepostRequest;
import com.hoop.hoopback.dto.response.PostDto;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.Post;
import com.hoop.hoopback.entity.Repost;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.DuplicateResourceException;
import com.hoop.hoopback.exception.ResourceNotFoundException;
import com.hoop.hoopback.mapper.UserMapper;
import com.hoop.hoopback.repository.PostRepository;
import com.hoop.hoopback.repository.RepostRepository;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RepostService {

    private final RepostRepository repostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PostDto repost(String username, Long id, RepostRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        Post originalPost = postRepository.findWithAuthorById(id)
                .orElseGet(() -> repostRepository.findById(id)
                        .map(repost -> postRepository.findWithAuthorById(repost.getOriginalPost().getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Оригинальный пост не найден")))
                        .orElseThrow(() -> new ResourceNotFoundException("Пост не найден")));

        if (repostRepository.existsByUserAndOriginalPost(user, originalPost)) {
            throw new DuplicateResourceException("Вы уже репостнули этот пост");
        }

        Repost repost = Repost.builder()
                .user(user)
                .originalPost(originalPost)
                .caption(request != null ? request.caption() : null)
                .build();

        Repost saved = repostRepository.save(repost);

        eventPublisher.publishEvent(new com.hoop.hoopback.event.PostRepostedEvent(this, user, originalPost.getAuthor(), originalPost.getId()));

        return mapRepostToPostDto(saved, user);
    }

    private PostDto mapRepostToPostDto(Repost repost, User currentUser) {
        Post original = repost.getOriginalPost();
        UserSummaryDto authorDto = userMapper.toSummaryDto(repost.getUser());
        UserSummaryDto originalAuthorDto = userMapper.toSummaryDto(original.getAuthor());

        PostDto originalDto = new PostDto(
                original.getId(),
                originalAuthorDto,
                original.getContent(),
                original.getCreatedAt(),
                original.getLikesCount() != null ? original.getLikesCount() : 0L,
                original.getCommentsCount() != null ? original.getCommentsCount() : 0L,
                original.getRepostsCount() != null ? original.getRepostsCount() : 0L,
                false, false, null, null);

        return new PostDto(
                repost.getId(),
                authorDto,
                repost.getCaption() != null ? repost.getCaption() : "",
                repost.getCreatedAt(),
                originalDto.likesCount(),
                originalDto.commentsCount(),
                originalDto.repostsCount(),
                originalDto.isLiked(),
                originalDto.isReposted(),
                originalDto,
                repost.getCaption());
    }
}
