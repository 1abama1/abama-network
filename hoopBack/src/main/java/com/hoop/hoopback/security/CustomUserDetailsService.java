package com.hoop.hoopback.security;

import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier != null && EMAIL_PATTERN.matcher(identifier).matches()) {
            return userRepository.findByEmail(identifier)
                    .map(SecurityUserAdapter::new)
                    .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с email: " + identifier));
        } else {
            return userRepository.findByUsername(identifier)
                    .map(SecurityUserAdapter::new)
                    .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с username: " + identifier));
        }
    }
}
