package com.smartcampus.api.user.dto;

import com.smartcampus.api.user.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO for returning user data in API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private String oauthProvider;
    private Set<Role> roles;
    private Boolean isActive;
    private Boolean notificationEmailEnabled;
    private Boolean notificationBookingEnabled;
    private Boolean notificationTicketEnabled;
    private Boolean notificationCommentEnabled;
    private LocalDateTime createdAt;
}
