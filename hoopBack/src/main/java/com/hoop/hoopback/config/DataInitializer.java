package com.hoop.hoopback.config;

import com.hoop.hoopback.entity.*;
import com.hoop.hoopback.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final GameRepository gameRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        // --- Users ---
        User coachJohn = User.builder()
                .username("coach_john")
                .email("john@hoop.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.USER)
                .isEnabled(true)
                .bio("Elite trainer. Focus on fundamentals.")
                .height(185.0)
                .weight(88.0)
                .jump(30.0)
                .positions(Set.of(Position.POINT_GUARD))
                .build();

        User ballerPro = User.builder()
                .username("baller_pro")
                .email("pro@hoop.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.USER)
                .isEnabled(true)
                .bio("Just a kid who loves the game. 🏀")
                .height(198.0)
                .weight(95.0)
                .jump(38.0)
                .positions(Set.of(Position.SMALL_FORWARD, Position.SHOOTING_GUARD))
                .build();

        User hoopKing = User.builder()
                .username("hoop_king")
                .email("king@hoop.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.USER)
                .isEnabled(true)
                .bio("I live on the blacktop.")
                .height(208.0)
                .weight(110.0)
                .jump(32.0)
                .positions(Set.of(Position.CENTER, Position.POWER_FORWARD))
                .build();

        userRepository.saveAll(Set.of(coachJohn, ballerPro, hoopKing));

        // --- Posts ---
        Post post1 = Post.builder()
                .author(ballerPro)
                .content("Morning session in the lab. Consistency is key! 🧪🏀")
                .build();

        Post post2 = Post.builder()
                .author(coachJohn)
                .content("Fundamentals are the foundation of greatness. Don't skip the basics.")
                .build();

        Post post3 = Post.builder()
                .author(hoopKing)
                .content("Who's down for a 5v5 at Sunset Park tomorrow?")
                .build();

        postRepository.saveAll(Set.of(post1, post2, post3));

        // --- Games ---
        Game run1 = Game.builder()
                .creator(hoopKing)
                .title("Sunset Park 5v5")
                .description("Competitive full-court run. No beginners please.")
                .location("Sunset Park Courts, Brooklyn")
                .dateTime(LocalDateTime.now().plusDays(1).withHour(18).withMinute(0))
                .minPlayers(10)
                .maxPlayers(15)
                .build();

        Game run2 = Game.builder()
                .creator(coachJohn)
                .title("Youth Skills Clinic")
                .description("Focus on shooting forms and footwork.")
                .location("Downtown YMCA")
                .dateTime(LocalDateTime.now().plusDays(3).withHour(10).withMinute(0))
                .minPlayers(5)
                .maxPlayers(20)
                .build();

        gameRepository.saveAll(Set.of(run1, run2));
        
        System.out.println("--- Sample Data Initialized ---");
    }
}
