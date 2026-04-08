package com.smartcampus.api.notification.model;

/**
 * Notification types covering all system events
 */
public enum NotificationType {
    // Booking events
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    BOOKING_CANCELLED,
    BOOKING_PENDING,

    // Ticket events
    TICKET_STATUS_UPDATED,
    TICKET_ASSIGNED,
    TICKET_RESOLVED,
    TICKET_REJECTED,

    // Comment events
    NEW_COMMENT,

    // System events
    ROLE_CHANGED,
    SYSTEM_ANNOUNCEMENT
}
