package com.smartcampus.api.booking.dto;

import com.smartcampus.api.booking.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private String resourceType;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private String notes;
    private BookingStatus status;
    private String rejectionReason;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String approvedByName;
    private LocalDateTime approvedAt;
}
