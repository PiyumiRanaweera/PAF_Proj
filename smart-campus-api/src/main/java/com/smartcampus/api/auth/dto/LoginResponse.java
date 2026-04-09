package com.smartcampus.api.auth.dto;

import com.smartcampus.api.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login Response DTO
 * 
 * Returns authentication token and user data after successful login.
 * Sent to frontend to establish authenticated session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /**
     * JWT access token
     * Used for subsequent authenticated API requests
     */
    private String accessToken;

    /**
     * Token type (usually "Bearer")
     */
    private String tokenType = "Bearer";

    /**
     * Token expiration time in seconds
     * Default: 24 hours (86400 seconds)
     */
    private Long expiresIn;

    /**
     * Authenticated user's profile information
     */
    private UserDTO user;
}
