package com.smartcampus.api.auth.controller;

import com.smartcampus.api.auth.dto.AdminLoginRequest;
import com.smartcampus.api.auth.dto.LoginResponse;
import com.smartcampus.api.auth.service.AuthService;
import com.smartcampus.api.user.dto.UserDTO;
import com.smartcampus.api.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * Authentication Controller
 * 
 * Handles all authentication-related endpoints including OAuth2 callback
 * and admin/staff email+password login.
 * 
 * Base Path: /api/auth
 * 
 * @author Smart Campus Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    /**
     * Admin/Staff login with email and password
     * 
     * POST /api/auth/admin/login
     * 
     * Authenticates staff and admin users with credentials.
     * Validates email and password, checks admin/staff role, and returns JWT token.
     * 
     * Request Body:
     * {
     *   "email": "admin@smartcampus.edu",
     *   "password": "securePassword123"
     * }
     * 
     * Success Response (200 OK):
     * {
     *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "tokenType": "Bearer",
     *   "expiresIn": 86400,
     *   "user": {
     *     "id": 1,
     *     "email": "admin@smartcampus.edu",
     *     "name": "Admin User",
     *     "roles": ["ADMIN"],
     *     ...
     *   }
     * }
     * 
     * Error Responses:
     * - 400 Bad Request: Missing or invalid email/password
     * - 401 Unauthorized: Invalid credentials
     * - 403 Forbidden: User is inactive or lacks admin role
     * - 404 Not Found: User not found
     * 
     * @param request AdminLoginRequest containing email and password
     * @return ResponseEntity containing LoginResponse with token and user data
     */
    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> adminLogin(
            @Valid @RequestBody AdminLoginRequest request) {
        log.debug("Processing admin login for email: {}", request.getEmail());
        
        try {
            LoginResponse response = authService.adminLogin(request);
            log.info("Admin login successful for: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Admin login failed for email: {}", request.getEmail(), e);
            throw e;
        }
    }

    /**
     * Get current authenticated user's profile
     * 
     * GET /api/auth/me
     * 
     * Retrieves the full profile of the currently authenticated user.
     * Used by frontend after OAuth2 redirect or successful login to get user data.
     * 
     * Authentication: Required (JWT or OAuth2)
     * 
     * Response (200 OK):
     * {
     *   "id": 1,
     *   "email": "user@smartcampus.edu",
     *   "name": "User Name",
     *   "roles": ["USER"],
     *   "avatarUrl": "https://...",
     *   ...
     * }
     * 
     * @param userDetails the authenticated user's security principal (injected by Spring Security)
     * @return ResponseEntity containing UserDTO with user's profile information
     * 
     * @throws ResponseStatusException (401) if not authenticated
     * @throws ResponseStatusException (404) if user not found
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Fetching profile for authenticated user: {}", userDetails.getUsername());
        UserDTO user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    /**
     * Authentication service status check
     * 
     * GET /api/auth/status
     * 
     * Simple health check endpoint to verify auth service is accessible.
     * Does not require authentication.
     * 
     * Response (200 OK):
     * {
     *   "status": "running",
     *   "message": "Auth service is operational"
     * }
     * 
     * @return ResponseEntity with status information
     */
    @GetMapping("/status")
    public ResponseEntity<String> authStatus() {
        log.debug("Auth service status check");
        return ResponseEntity
                .status(HttpStatus.OK)
                .body("Auth service is operational");
    }

    /**
     * Logout endpoint
     * 
     * POST /api/auth/logout
     * 
     * Invalidates the current session token.
     * Frontend should clear localStorage after receiving this response.
     * 
     * Authentication: Required
     * 
     * Response (204 No Content)
     * 
     * @param userDetails the authenticated user
     * @return ResponseEntity with no content
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("User logged out: {}", userDetails.getUsername());
        // Token invalidation can be implemented using token blacklist/JWT refresh tokens
        // For now, frontend clears localStorage which effectively logs out the user
        return ResponseEntity.noContent().build();
    }
}
