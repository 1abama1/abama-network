package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.CreateCommentRequest;
import com.hoop.hoopback.dto.response.CommentDto;
import com.hoop.hoopback.entity.*;
import com.hoop.hoopback.exception.ResourceNotFoundException;
import com.hoop.hoopback.mapper.UserMapper;
import com.hoop.hoopback.repository.CommentRepository;
import com.hoop.hoopback.repository.PostRepository;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CommentDto addComment(String username, Long postId, CreateCommentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Пост не найден"));

        Comment comment = Comment.builder()
                .author(user)
                .post(post)
                .content(request.content())
                .build();

        Comment saved = commentRepository.save(comment);

        eventPublisher.publishEvent(new com.hoop.hoopback.event.CommentAddedEvent(this, user, post.getAuthor(), post.getId()));

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getPostComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Пост не найден"));
        return commentRepository.findAllByPostOrderByCreatedAtAsc(post).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CommentDto mapToDto(Comment comment) {
        return new CommentDto(
                comment.getId(),
                userMapper.toSummaryDto(comment.getAuthor()),
                comment.getContent(),
                comment.getCreatedAt());
    }
}
