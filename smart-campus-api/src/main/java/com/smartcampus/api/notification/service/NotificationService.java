package com.smartcampus.api.notification.service;

import com.smartcampus.api.notification.dto.NotificationDTO;
import com.smartcampus.api.notification.dto.NotificationRequest;
import com.smartcampus.api.notification.model.Notification;
import com.smartcampus.api.notification.model.NotificationType;
import com.smartcampus.api.notification.repository.NotificationRepository;
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
 * Service for notification management
 * Called by other modules (Booking, Tickets) to dispatch notifications
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    /**
     * Create and send a notification to a user
     * This is the main entry point for other modules
     */
    @Transactional
    public NotificationDTO sendNotification(NotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User not found with id: " + request.getUserId()));

        // Check user's notification preferences
        if (!shouldSendNotification(user, request.getType())) {
            log.info("Notification skipped for user {} — type {} is disabled by preferences",
                    user.getEmail(), request.getType());
            return null;
        }

        Notification notification = Notification.builder()
                .user(user)
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification sent to user {}: {}", user.getEmail(), request.getTitle());
        
        NotificationDTO dto = mapToDTO(saved);
        // Push notification via WebSocket
        try {
            messagingTemplate.convertAndSendToUser(
                    user.getEmail(),
                    "/queue/notifications",
                    dto
            );
        } catch (Exception e) {
            log.error("Failed to push notification via WebSocket: {}", e.getMessage());
        }
        
        return dto;
    }

    /**
     * Convenience method — send notification by userId directly
     */
    @Transactional
    public void send(Long userId, NotificationType type, String title, String message,
                     Long referenceId, String referenceType) {
        sendNotification(NotificationRequest.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build());
    }

    /**
     * Get all notifications for the current user
     */
    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications for the current user
     */
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notification count for the current user
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Mark a single notification as read
     */
    @Transactional
    public NotificationDTO markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsReadByIdAndUserId(notificationId, userId);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Notification not found or does not belong to current user");
        }
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        return mapToDTO(notification);
    }

    /**
     * Mark all notifications as read for current user
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
        log.info("Marked all notifications as read for user id: {}", userId);
    }

    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete another user's notification");
        }

        notificationRepository.delete(notification);
        log.info("Deleted notification {} for user {}", notificationId, userId);
    }

    /**
     * Check if notification should be sent based on user preferences
     */
    private boolean shouldSendNotification(User user, NotificationType type) {
        switch (type) {
            case BOOKING_APPROVED:
            case BOOKING_REJECTED:
            case BOOKING_CANCELLED:
            case BOOKING_PENDING:
                return Boolean.TRUE.equals(user.getNotificationBookingEnabled());
            case TICKET_STATUS_UPDATED:
            case TICKET_ASSIGNED:
            case TICKET_RESOLVED:
            case TICKET_REJECTED:
                return Boolean.TRUE.equals(user.getNotificationTicketEnabled());
            case NEW_COMMENT:
                return Boolean.TRUE.equals(user.getNotificationCommentEnabled());
            default:
                return true;
        }
    }

    /**
     * Map Notification entity to DTO
     */
    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
