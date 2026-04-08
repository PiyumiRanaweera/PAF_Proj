package com.smartcampus.api.auth.controller;

import com.smartcampus.api.user.dto.UserDTO;
import com.smartcampus.api.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Auth controller — provides current user info after OAuth2 login
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * GET /api/auth/me — Get current authenticated user profile
     * Called by React after receiving JWT from OAuth2 redirect
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserDTO user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    /**
     * GET /api/auth/status — Simple health check for auth
     */
    @GetMapping("/status")
    public ResponseEntity<String> authStatus() {
        return ResponseEntity.ok("Auth service is running");
    }
}
