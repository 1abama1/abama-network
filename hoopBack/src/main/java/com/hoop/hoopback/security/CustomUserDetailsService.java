package com.hoop.hoopback.security;

import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier != null && identifier.contains("@")) {
            return userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с email: " + identifier));
        } else {
            return userRepository.findByUsername(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с username: " + identifier));
        }
    }
}
