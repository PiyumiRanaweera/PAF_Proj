package com.smartcampus.api.user.controller;

import com.smartcampus.api.user.dto.NotificationPreferencesRequest;
import com.smartcampus.api.user.dto.RoleAssignRequest;
import com.smartcampus.api.user.dto.UserDTO;
import com.smartcampus.api.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * User management controller
 * Members 1-3 will call UserService methods for user lookup
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me — Get current user's full profile
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserByEmail(userDetails.getUsername()));
    }

    /**
     * PATCH /api/users/me/notifications — Update notification preferences
     */
    @PatchMapping("/me/notifications")
    public ResponseEntity<UserDTO> updateNotificationPreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid NotificationPreferencesRequest request) {
        return ResponseEntity.ok(userService.updateNotificationPreferences(userDetails.getUsername(), request));
    }

    /**
     * GET /api/users — Get all users (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * GET /api/users/{id} — Get user by ID (Admin only)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * PUT /api/users/{id}/role — Assign or remove role from user (Admin only)
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long id,
            @RequestBody @Valid RoleAssignRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request));
    }

    /**
     * DELETE /api/users/{id} — Deactivate user account (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }
}
