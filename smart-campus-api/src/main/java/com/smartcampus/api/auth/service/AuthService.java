package com.smartcampus.api.auth.service;

import com.smartcampus.api.auth.dto.AdminLoginRequest;
import com.smartcampus.api.auth.dto.LoginResponse;
import com.smartcampus.api.user.dto.UserDTO;
import com.smartcampus.api.user.model.Role;
import com.smartcampus.api.user.model.User;
import com.smartcampus.api.user.repository.UserRepository;
import com.smartcampus.api.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Authentication Service
 * 
 * Handles authentication logic for different login methods:
 * - Admin/Staff email + password login
 * - OAuth2 user login (handled by Spring Security)
 * 
 * Provides token generation and user validation.
 * 
 * @author Smart Campus Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authenticate admin/staff user with email and password
     * 
     * Process:
     * 1. Validate input credentials
     * 2. Find user by email
     * 3. Verify password
     * 4. Check if user is active and has admin role
     * 5. Generate JWT token
     * 6. Return token and user profile
     * 
     * @param request contains email and password
     * @return LoginResponse with access token and user data
     * 
     * @throws ResponseStatusException (401) if credentials are invalid
     * @throws ResponseStatusException (403) if user is not admin or account is inactive
     * @throws ResponseStatusException (404) if user not found
     */
    public LoginResponse adminLogin(AdminLoginRequest request) {
        log.debug("Admin login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login attempt with non-existent email: {}", request.getEmail());
                    return new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "Invalid email or password"
                    );
                });

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Failed password attempt for user: {}", request.getEmail());
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        // Check if user is active
        if (!user.getIsActive()) {
            log.warn("Login attempt by inactive user: {}", request.getEmail());
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Account is inactive. Contact administration."
            );
        }

        // Check if user has admin role
        boolean hasAdminRole = user.getRoles().contains(Role.ADMIN)
                || user.getRoles().contains(Role.MANAGER)
                || user.getRoles().contains(Role.TECHNICIAN);

        if (!hasAdminRole) {
            log.warn("Non-admin user attempted admin login: {}", request.getEmail());
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to access the admin portal"
            );
        }

        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());
        log.info("Successful admin login for user: {}", user.getEmail());

        // Get user DTO
        UserDTO userDTO = userService.getUserByEmail(user.getEmail());

        // Return response
        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(86400L) // 24 hours in seconds
                .user(userDTO)
                .build();
    }

    /**
     * Validate JWT token and extract email
     * 
     * @param token JWT token to validate
     * @return email extracted from token
     * 
     * @throws ResponseStatusException if token is invalid or expired
     */
    public String validateTokenAndGetEmail(String token) {
        try {
            return jwtService.getEmailFromToken(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid or expired token"
            );
        }
    }
}
