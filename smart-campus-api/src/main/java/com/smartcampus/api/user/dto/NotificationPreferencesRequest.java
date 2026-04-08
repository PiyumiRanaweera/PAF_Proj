package com.smartcampus.api.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating notification preferences
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferencesRequest {
    private Boolean notificationEmailEnabled;
    private Boolean notificationBookingEnabled;
    private Boolean notificationTicketEnabled;
    private Boolean notificationCommentEnabled;
}
