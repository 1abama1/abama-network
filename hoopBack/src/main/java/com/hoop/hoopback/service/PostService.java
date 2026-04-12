package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.CreatePostRequest;
import com.hoop.hoopback.dto.response.CommentDto;
import com.hoop.hoopback.dto.response.PostDto;
import com.hoop.hoopback.entity.Post;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.ResourceNotFoundException;
import com.hoop.hoopback.exception.UnauthorizedOperationException;
import com.hoop.hoopback.mapper.UserMapper;
import com.hoop.hoopback.repository.LikeRepository;
import com.hoop.hoopback.repository.PostRepository;
import com.hoop.hoopback.repository.RepostRepository;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final RepostRepository repostRepository;
    private final UserMapper userMapper;

    @Transactional
    public PostDto createPost(String username, CreatePostRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        Post post = Post.builder()
                .author(user)
                .content(request.content())
                .build();

        return mapToDto(postRepository.save(post), user);
    }

    @Transactional
    public void deletePost(String username, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Пост не найден"));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new UnauthorizedOperationException("Вы не можете удалить чужой пост");
        }

        postRepository.delete(post);
    }

    public Page<PostDto> getFeed(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        List<User> following = userRepository.findFollowingByUsername(username);
        following.add(user);

        Page<Post> postsPage = postRepository.findAllByAuthorInOrderByCreatedAtDesc(following, pageable);
        return mapToDtoPage(postsPage, user);
    }

    public Page<PostDto> getGlobalFeed(String currentUsername, Pageable pageable) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return mapToDtoPage(postRepository.findAllByOrderByCreatedAtDesc(pageable), currentUser);
    }

    public Page<PostDto> getUserPosts(String username, String currentUsername, Pageable pageable) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return mapToDtoPage(postRepository.findAllByAuthorUsernameOrderByCreatedAtDesc(username, pageable), currentUser);
    }

    public Page<PostDto> getLikedPosts(String username, String currentUsername, Pageable pageable) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return mapToDtoPage(likeRepository.findLikedPostsByUsername(username, pageable), currentUser);
    }

    public Page<PostDto> searchPosts(String q, String currentUsername, Pageable pageable) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return mapToDtoPage(postRepository.searchByContent(q, pageable), currentUser);
    }

    public List<CommentDto> getPostComments(Long postId) {
        throw new UnsupportedOperationException("Use CommentService.addComment / getPostComments instead");
    }

    public PostDto getPostById(Long postId, String currentUsername) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Пост не найден"));
        return mapToDto(post, currentUser);
    }

    private Page<PostDto> mapToDtoPage(Page<Post> postsPage, User currentUser) {
        if (postsPage.isEmpty()) {
            return postsPage.map(post -> mapToDtoWithCache(post, currentUser, false, false));
        }

        Set<Long> likedPostIds = Collections.emptySet();
        Set<Long> repostedPostIds = Collections.emptySet();

        if (currentUser != null) {
            List<Long> postIds = postsPage.getContent().stream().map(Post::getId).collect(Collectors.toList());
            likedPostIds = likeRepository.findPostIdsByUserIdAndPostIdIn(currentUser.getId(), postIds);
            repostedPostIds = repostRepository.findOriginalPostIdsByUserIdAndOriginalPostIdIn(currentUser.getId(), postIds);
        }

        final Set<Long> finalLiked = likedPostIds;
        final Set<Long> finalReposted = repostedPostIds;

        return postsPage.map(post -> mapToDtoWithCache(post, currentUser,
                finalLiked.contains(post.getId()), finalReposted.contains(post.getId())));
    }

    private PostDto mapToDto(Post post, User currentUser) {
        boolean isLiked = currentUser != null && likeRepository.existsByUserAndPost(currentUser, post);
        boolean isReposted = currentUser != null && repostRepository.existsByUserAndOriginalPost(currentUser, post);
        return mapToDtoWithCache(post, currentUser, isLiked, isReposted);
    }

    private PostDto mapToDtoWithCache(Post post, User currentUser, boolean isLiked, boolean isReposted) {
        return new PostDto(
                post.getId(),
                userMapper.toSummaryDto(post.getAuthor()),
                post.getContent(),
                post.getCreatedAt(),
                post.getLikesCount() != null ? post.getLikesCount() : 0L,
                post.getCommentsCount() != null ? post.getCommentsCount() : 0L,
                post.getRepostsCount() != null ? post.getRepostsCount() : 0L,
                isLiked,
                isReposted,
                null,
                null);
    }
}
