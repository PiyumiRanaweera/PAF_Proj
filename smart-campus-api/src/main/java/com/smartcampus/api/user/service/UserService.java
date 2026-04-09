package com.smartcampus.api.user.service;

import com.smartcampus.api.user.dto.NotificationPreferencesRequest;
import com.smartcampus.api.user.dto.RoleAssignRequest;
import com.smartcampus.api.user.dto.UserDTO;
import com.smartcampus.api.user.model.Role;
import com.smartcampus.api.user.model.User;
import com.smartcampus.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User Service
 * 
 * Handles business logic for user profile management, notification preferences, 
 * and role-based access control. Provides methods for user retrieval, profile updates,
 * and role assignments.
 * 
 * Transactional operations ensure data consistency and integrity.
 * 
 * @author Smart Campus Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Retrieve user by email address
     * 
     * Typically used to fetch the current authenticated user from their JWT email claim.
     * 
     * @param email the user's email address (extracted from JWT token)
     * @return UserDTO containing the user's profile information
     * 
     * @throws ResponseStatusException (404) if user with given email is not found
     */
    public UserDTO getUserByEmail(String email) {
        log.debug("Retrieving user by email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });
        return mapToDTO(user);
    }

    /**
     * Retrieve user by unique identifier
     * 
     * @param id the user's unique identifier
     * @return UserDTO containing the user's profile information
     * 
     * @throws ResponseStatusException (404) if user with given ID is not found
     */
    public UserDTO getUserById(Long id) {
        log.debug("Retrieving user by ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id);
                });
        return mapToDTO(user);
    }

    /**
     * Retrieve all users in the system
     * 
     * Note: This method should only be called by administrators.
     * 
     * @return List of all users as UserDTOs
     */
    public List<UserDTO> getAllUsers() {
        log.debug("Retrieving all users");
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update user's assigned roles
     * 
     * Allows administrators to add or remove roles from a user. 
     * A user must always maintain at least one role (USER).
     * 
     * @param userId the user's unique identifier
     * @param request contains the role to assign/remove and action (ADD/REMOVE)
     * @return UserDTO containing the updated user profile
     * 
     * @throws ResponseStatusException (404) if user is not found
     * @throws ResponseStatusException (400) if attempting to remove the only USER role
     */
    @Transactional
    public UserDTO updateUserRole(Long userId, RoleAssignRequest request) {
        log.debug("Updating role for user ID: {}, request: {}", userId, request);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + userId);
                });

        Role role = request.getRole();
        String action = request.getAction() != null ? request.getAction().toUpperCase() : "ADD";

        if ("REMOVE".equals(action)) {
            // Validate that user retains at least one role
            if (role == Role.USER && user.getRoles().size() == 1) {
                log.warn("Attempted to remove only role (USER) from user: {}", user.getEmail());
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, 
                        "Cannot remove the only role. User must have at least the USER role."
                );
            }
            user.getRoles().remove(role);
            log.info("Removed role {} from user {}", role, user.getEmail());
        } else {
            user.getRoles().add(role);
            log.info("Added role {} to user {}", role, user.getEmail());
        }

        return mapToDTO(userRepository.save(user));
    }

    /**
     * Update user's notification preferences
     * 
     * Allows users to customize which types of notifications they receive.
     * Only non-null preference values are updated; null values are ignored.
     * 
     * @param email the user's email address (from JWT)
     * @param request contains the notification preferences to update
     * @return UserDTO containing the updated user profile with new preferences
     * 
     * @throws ResponseStatusException (404) if user is not found
     */
    @Transactional
    public UserDTO updateNotificationPreferences(String email, NotificationPreferencesRequest request) {
        log.debug("Updating notification preferences for user: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });

        // Update only provided preferences
        if (request.getNotificationEmailEnabled() != null)
            user.setNotificationEmailEnabled(request.getNotificationEmailEnabled());
        if (request.getNotificationBookingEnabled() != null)
            user.setNotificationBookingEnabled(request.getNotificationBookingEnabled());
        if (request.getNotificationTicketEnabled() != null)
            user.setNotificationTicketEnabled(request.getNotificationTicketEnabled());
        if (request.getNotificationCommentEnabled() != null)
            user.setNotificationCommentEnabled(request.getNotificationCommentEnabled());

        log.info("Updated notification preferences for user: {}", email);
        return mapToDTO(userRepository.save(user));
    }

    /**
     * Deactivate a user account
     * 
     * Marks a user as inactive (soft delete). All user data is preserved in the database.
     * Note: This method should only be called by administrators.
     * 
     * @param userId the user's unique identifier
     * 
     * @throws ResponseStatusException (404) if user is not found
     */
    @Transactional
    public void deactivateUser(Long userId) {
        log.debug("Deactivating user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + userId);
                });
        
        user.setIsActive(false);
        userRepository.save(user);
        log.warn("User deactivated: {}", user.getEmail());
    }

    /**
     * Convert User entity to UserDTO
     * 
     * Maps all relevant user data from the entity to a data transfer object
     * for API responses. Ensures sensitive data is not exposed.
     * 
     * @param user the User entity to convert
     * @return UserDTO containing the user's public profile information
     */
    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .oauthProvider(user.getOauthProvider())
                .roles(user.getRoles())
                .isActive(user.getIsActive())
                .notificationEmailEnabled(user.getNotificationEmailEnabled())
                .notificationBookingEnabled(user.getNotificationBookingEnabled())
                .notificationTicketEnabled(user.getNotificationTicketEnabled())
                .notificationCommentEnabled(user.getNotificationCommentEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
