package com.smartcampus.api.user.controller;

import com.smartcampus.api.user.dto.NotificationPreferencesRequest;
import com.smartcampus.api.user.dto.RoleAssignRequest;
import com.smartcampus.api.user.dto.UserDTO;
import com.smartcampus.api.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * User Management Controller
 * 
 * Handles user profile operations, notification preferences, and role management.
 * Provides RESTful endpoints for retrieving and updating user information.
 * 
 * Base Path: /api/users
 * 
 * @author Smart Campus Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Retrieve the current authenticated user's profile
     * 
     * GET /api/users/me
     * 
     * @param userDetails the authenticated user's security principal
     * @return ResponseEntity containing the current user's profile data (UserDTO)
     * 
     * @throws org.springframework.web.server.ResponseStatusException (404) if user not found
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Fetching profile for user: {}", userDetails.getUsername());
        return ResponseEntity.ok(userService.getUserByEmail(userDetails.getUsername()));
    }

    /**
     * Update the current user's notification preferences
     * 
     * PATCH /api/users/me/notifications
     * 
     * @param userDetails the authenticated user's security principal
     * @param request the notification preferences to update (NotificationPreferencesRequest)
     * @return ResponseEntity containing the updated user profile (UserDTO)
     * 
     * @throws org.springframework.web.server.ResponseStatusException (404) if user not found
     * @throws org.springframework.web.bind.MethodArgumentNotValidException if validation fails
     */
    @PatchMapping("/me/notifications")
    public ResponseEntity<UserDTO> updateNotificationPreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NotificationPreferencesRequest request) {
        log.info("User {} updating notification preferences", userDetails.getUsername());
        UserDTO updatedUser = userService.updateNotificationPreferences(userDetails.getUsername(), request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Retrieve all users in the system
     * 
     * GET /api/users
     * 
     * Authorization: ADMIN role required
     * 
     * @return ResponseEntity containing list of all users (List&lt;UserDTO&gt;)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        log.debug("Fetching all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Retrieve a specific user by ID
     * 
     * GET /api/users/{id}
     * 
     * Authorization: ADMIN role required
     * 
     * @param id the user's unique identifier
     * @return ResponseEntity containing the requested user's profile (UserDTO)
     * 
     * @throws org.springframework.web.server.ResponseStatusException (404) if user not found
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(
            @PathVariable Long id) {
        log.debug("Fetching user by ID: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * Assign or remove a role from a user
     * 
     * PUT /api/users/{id}/role
     * 
     * Authorization: ADMIN role required
     * 
     * @param id the user's unique identifier
     * @param request the role assignment request (RoleAssignRequest) containing role and action (ADD/REMOVE)
     * @return ResponseEntity containing the updated user profile (UserDTO)
     * 
     * @throws org.springframework.web.server.ResponseStatusException (404) if user not found
     * @throws org.springframework.web.server.ResponseStatusException (400) if role cannot be removed (User must have at least one role)
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleAssignRequest request) {
        log.info("Updating role for user ID: {} with action: {}", id, request.getAction());
        return ResponseEntity.ok(userService.updateUserRole(id, request));
    }

    /**
     * Deactivate a user account
     * 
     * DELETE /api/users/{id}
     * 
     * Authorization: ADMIN role required
     * 
     * Account will be marked as inactive but data will be preserved in the database.
     * 
     * @param id the user's unique identifier
     * @return ResponseEntity with no content (204 No Content)
     * 
     * @throws org.springframework.web.server.ResponseStatusException (404) if user not found
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(
            @PathVariable Long id) {
        log.warn("Deactivating user ID: {}", id);
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }
}
