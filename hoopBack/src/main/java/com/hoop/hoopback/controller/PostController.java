package com.hoop.hoopback.controller;

import com.hoop.hoopback.dto.request.CreateCommentRequest;
import com.hoop.hoopback.dto.request.CreatePostRequest;
import com.hoop.hoopback.dto.request.RepostRequest;
import com.hoop.hoopback.dto.response.CommentDto;
import com.hoop.hoopback.dto.response.PostDto;
import com.hoop.hoopback.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody CreatePostRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.createPost(authentication.getName(), request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId, Authentication authentication) {
        postService.deletePost(authentication.getName(), postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPost(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.getPostById(
                postId,
                authentication != null ? authentication.getName() : null));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> likePost(@PathVariable Long postId, Authentication authentication) {
        postService.likePost(authentication.getName(), postId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<Void> unlikePost(@PathVariable Long postId, Authentication authentication) {
        postService.unlikePost(authentication.getName(), postId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.addComment(authentication.getName(), postId, request));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostComments(postId));
    }

    @PostMapping("/{postId}/repost")
    public ResponseEntity<PostDto> repost(
            @PathVariable Long postId,
            @RequestBody(required = false) RepostRequest request,
            Authentication authentication
    ) {
        // Handle empty request body if any, providing default if needed
        return ResponseEntity.ok(postService.repost(authentication.getName(), postId, 
                request != null ? request : new RepostRequest(null)));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostDto>> getFeed(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.getFeed(authentication.getName(), pageable));
    }

    @GetMapping("/explore")
    public ResponseEntity<Page<PostDto>> getGlobalFeed(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.getGlobalFeed(
                authentication != null ? authentication.getName() : null, 
                pageable));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PostDto>> getUserPosts(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.getUserPosts(
                username,
                authentication != null ? authentication.getName() : null,
                pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PostDto>> searchPosts(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.searchPosts(
                q,
                authentication != null ? authentication.getName() : null,
                pageable));
    }
}
