package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.CreateCommentRequest;
import com.hoop.hoopback.dto.request.CreatePostRequest;
import com.hoop.hoopback.dto.request.RepostRequest;
import com.hoop.hoopback.dto.response.CommentDto;
import com.hoop.hoopback.dto.response.PostDto;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.*;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

        private final PostRepository postRepository;
        private final CommentRepository commentRepository;
        private final LikeRepository likeRepository;
        private final RepostRepository repostRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;

        @Transactional
        public PostDto createPost(String username, CreatePostRequest request) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));

                Post post = Post.builder()
                                .author(user)
                                .content(request.content())
                                .build();

                return mapToDto(postRepository.save(post), user);
        }

        @Transactional
        public void deletePost(String username, Long postId) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Пост не найден"));

                if (!post.getAuthor().getUsername().equals(username)) {
                        throw new IllegalArgumentException("Вы не можете удалить чужой пост");
                }

                postRepository.delete(post);
        }

        @Transactional
        public void likePost(String username, Long postId) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Пост не найден"));

                if (likeRepository.existsByUserAndPost(user, post)) {
                        return;
                }

                Like like = Like.builder()
                                .user(user)
                                .post(post)
                                .build();

                likeRepository.save(like);

                // Notify post author
                notificationService.notify(post.getAuthor(), user, NotificationType.LIKE, post.getId(), "POST");
        }

        @Transactional
        public void unlikePost(String username, Long postId) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Пост не найден"));

                likeRepository.findByUserAndPost(user, post)
                                .ifPresent(likeRepository::delete);
        }

        @Transactional
        public CommentDto addComment(String username, Long postId, CreateCommentRequest request) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Пост не найден"));

                Comment comment = Comment.builder()
                                .author(user)
                                .post(post)
                                .content(request.content())
                                .build();

                Comment saved = commentRepository.save(comment);

                // Notify post author
                notificationService.notify(post.getAuthor(), user, NotificationType.COMMENT, post.getId(), "POST");

                return mapToCommentDto(saved);
        }

        @Transactional
        public PostDto repost(String username, Long postId, RepostRequest request) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
                Post originalPost = postRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Пост не найден"));

                if (repostRepository.existsByUserAndOriginalPost(user, originalPost)) {
                        throw new IllegalStateException("Вы уже репостнули этот пост");
                }

                Repost repost = Repost.builder()
                                .user(user)
                                .originalPost(originalPost)
                                .caption(request.caption())
                                .build();

                Repost saved = repostRepository.save(repost);

                // Notify original post author
                notificationService.notify(originalPost.getAuthor(), user, NotificationType.REPOST,
                                originalPost.getId(), "POST");

                // Map to PostDto for the feed (a repost acts like a post in the feed)
                return mapRepostToPostDto(saved, user);
        }

        public Page<PostDto> getFeed(String username, Pageable pageable) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));

                List<User> following = userRepository.findFollowingByUsername(username);
                following.add(user); // Include own posts

                Page<Post> postsPage = postRepository.findAllByAuthorInOrderByCreatedAtDesc(following, pageable);
                return mapToDtoPage(postsPage, user);
        }

        public Page<PostDto> getGlobalFeed(String currentUsername, Pageable pageable) {
                User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null)
                                : null;
                return mapToDtoPage(postRepository.findAllByOrderByCreatedAtDesc(pageable), currentUser);
        }

        public Page<PostDto> getUserPosts(String username, String currentUsername, Pageable pageable) {
                User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null)
                                : null;
                return mapToDtoPage(postRepository.findAllByAuthorUsernameOrderByCreatedAtDesc(username, pageable), currentUser);
        }

        public Page<PostDto> searchPosts(String q, String currentUsername, Pageable pageable) {
                User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null)
                                : null;
                return mapToDtoPage(postRepository.searchByContent(q, pageable), currentUser);
        }

        public List<CommentDto> getPostComments(Long postId) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Пост не найден"));
                return commentRepository.findAllByPostOrderByCreatedAtAsc(post).stream()
                                .map(this::mapToCommentDto)
                                .collect(Collectors.toList());
        }

        public PostDto getPostById(Long postId, String currentUsername) {
                User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null)
                                : null;
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("Пост не найден"));
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
                boolean isReposted = currentUser != null
                                && repostRepository.existsByUserAndOriginalPost(currentUser, post);

                return mapToDtoWithCache(post, currentUser, isLiked, isReposted);
        }

        private PostDto mapToDtoWithCache(Post post, User currentUser, boolean isLiked, boolean isReposted) {
                return new PostDto(
                                post.getId(),
                                mapUserToSummaryDto(post.getAuthor()),
                                post.getContent(),
                                post.getCreatedAt(),
                                post.getLikesCount() != null ? post.getLikesCount() : 0L,
                                post.getCommentsCount() != null ? post.getCommentsCount() : 0L,
                                post.getRepostsCount() != null ? post.getRepostsCount() : 0L,
                                isLiked,
                                isReposted,
                                null, // Not a repost
                                null);
        }

        // Helper for feed displaying reposts
        private PostDto mapRepostToPostDto(Repost repost, User currentUser) {
                Post original = repost.getOriginalPost();
                PostDto originalDto = mapToDto(original, currentUser);

                return new PostDto(
                                repost.getId(),
                                mapUserToSummaryDto(repost.getUser()),
                                repost.getCaption() != null ? repost.getCaption() : "",
                                repost.getCreatedAt(),
                                originalDto.likesCount(), // Standard Twitter/X behavior: show original interaction
                                                          // counts
                                originalDto.commentsCount(),
                                originalDto.repostsCount(),
                                originalDto.isLiked(),
                                originalDto.isReposted(),
                                originalDto,
                                repost.getCaption());
        }

        private CommentDto mapToCommentDto(Comment comment) {
                return new CommentDto(
                                comment.getId(),
                                mapUserToSummaryDto(comment.getAuthor()),
                                comment.getContent(),
                                comment.getCreatedAt());
        }

        private UserSummaryDto mapUserToSummaryDto(User user) {
                return new UserSummaryDto(
                                user.getId(),
                                user.getUsername(),
                                user.getPositions(),
                                user.getHeight(),
                                user.getFollowersCount() != null ? user.getFollowersCount() : 0L);
        }
}
