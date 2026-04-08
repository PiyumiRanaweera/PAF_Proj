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
 * Service for user profile and role management operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get current user by email (from JWT)
     */
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToDTO(user);
    }

    /**
     * Get user by ID
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        return mapToDTO(user);
    }

    /**
     * Get all users (Admin only)
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Assign or remove a role from a user (Admin only)
     */
    @Transactional
    public UserDTO updateUserRole(Long userId, RoleAssignRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + userId));

        Role role = request.getRole();
        String action = request.getAction() != null ? request.getAction().toUpperCase() : "ADD";

        if ("REMOVE".equals(action)) {
            if (role == Role.USER && user.getRoles().size() == 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove the only role. User must have at least one role.");
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
     * Update notification preferences for current user
     */
    @Transactional
    public UserDTO updateNotificationPreferences(String email, NotificationPreferencesRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getNotificationEmailEnabled() != null)
            user.setNotificationEmailEnabled(request.getNotificationEmailEnabled());
        if (request.getNotificationBookingEnabled() != null)
            user.setNotificationBookingEnabled(request.getNotificationBookingEnabled());
        if (request.getNotificationTicketEnabled() != null)
            user.setNotificationTicketEnabled(request.getNotificationTicketEnabled());
        if (request.getNotificationCommentEnabled() != null)
            user.setNotificationCommentEnabled(request.getNotificationCommentEnabled());

        return mapToDTO(userRepository.save(user));
    }

    /**
     * Deactivate a user account (Admin only)
     */
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + userId));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("Deactivated user: {}", user.getEmail());
    }

    /**
     * Map User entity to UserDTO
     */
    public UserDTO mapToDTO(User user) {
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
