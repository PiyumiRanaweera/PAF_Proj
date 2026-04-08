package com.smartcampus.api.notification.service;

import com.smartcampus.api.notification.dto.NotificationRequest;
import com.smartcampus.api.notification.model.Notification;
import com.smartcampus.api.notification.model.NotificationType;
import com.smartcampus.api.notification.repository.NotificationRepository;
import com.smartcampus.api.user.model.Role;
import com.smartcampus.api.user.model.User;
import com.smartcampus.api.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for NotificationService
 * Member 4 - Individual testing evidence
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .roles(Set.of(Role.USER))
                .isActive(true)
                .notificationBookingEnabled(true)
                .notificationTicketEnabled(true)
                .notificationCommentEnabled(true)
                .build();
    }

    @Test
    @DisplayName("Should send notification when user preferences allow it")
    void shouldSendNotificationWhenPreferencesAllow() {
        NotificationRequest request = NotificationRequest.builder()
                .userId(1L)
                .type(NotificationType.BOOKING_APPROVED)
                .title("Booking Approved")
                .message("Your booking has been approved")
                .referenceId(10L)
                .referenceType("BOOKING")
                .build();

        Notification savedNotification = Notification.builder()
                .id(1L)
                .user(testUser)
                .type(NotificationType.BOOKING_APPROVED)
                .title("Booking Approved")
                .message("Your booking has been approved")
                .isRead(false)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(savedNotification);

        var result = notificationService.sendNotification(request);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Booking Approved");
        assertThat(result.getIsRead()).isFalse();
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should skip notification when booking notifications are disabled")
    void shouldSkipNotificationWhenBookingNotificationsDisabled() {
        testUser.setNotificationBookingEnabled(false);

        NotificationRequest request = NotificationRequest.builder()
                .userId(1L)
                .type(NotificationType.BOOKING_APPROVED)
                .title("Booking Approved")
                .message("Your booking has been approved")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        var result = notificationService.sendNotification(request);

        assertThat(result).isNull();
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw NOT_FOUND when user does not exist")
    void shouldThrowNotFoundWhenUserDoesNotExist() {
        NotificationRequest request = NotificationRequest.builder()
                .userId(99L)
                .type(NotificationType.BOOKING_APPROVED)
                .title("Test")
                .message("Test message")
                .build();

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.sendNotification(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Should return unread count for user")
    void shouldReturnUnreadCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        long count = notificationService.getUnreadCount(1L);

        assertThat(count).isEqualTo(5L);
    }

    @Test
    @DisplayName("Should throw FORBIDDEN when deleting another user's notification")
    void shouldThrowForbiddenWhenDeletingAnotherUsersNotification() {
        User anotherUser = User.builder().id(2L).email("other@example.com").build();
        Notification notification = Notification.builder()
                .id(1L)
                .user(anotherUser)
                .build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> notificationService.deleteNotification(1L, 1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("cannot delete another user's notification");
    }
}
