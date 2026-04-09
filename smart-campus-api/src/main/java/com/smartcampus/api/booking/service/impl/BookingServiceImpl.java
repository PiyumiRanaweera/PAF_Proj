package com.smartcampus.api.booking.service.impl;

import com.smartcampus.api.booking.dto.BookingRequest;
import com.smartcampus.api.booking.dto.BookingResponse;
import com.smartcampus.api.booking.exception.BookingConflictException;
import com.smartcampus.api.booking.model.Booking;
import com.smartcampus.api.booking.model.BookingStatus;
import com.smartcampus.api.booking.repository.BookingRepository;
import com.smartcampus.api.booking.service.BookingService;
import com.smartcampus.api.resource.model.Resource;
import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.repository.ResourceRepository;
import com.smartcampus.api.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, User user) {
        // 1. Validate resource
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new RuntimeException("Resource is not available for booking");
        }

        // 2. Validate capacity
        if (request.getExpectedAttendees() != null && resource.getCapacity() != null) {
            if (request.getExpectedAttendees() > resource.getCapacity()) {
                throw new RuntimeException("Expected attendees exceed resource capacity (" + resource.getCapacity() + ")");
            }
        }

        // 3. Conflict check (PENDING and APPROVED)
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                resource.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED)
        );

        if (!conflicts.isEmpty()) {
            Booking c = conflicts.get(0);
            throw new BookingConflictException("Conflict with an existing booking from " + c.getStartTime() + " to " + c.getEndTime());
        }

        // 4. Create entity
        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .build();

        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getMyBookings(User user, BookingStatus status, LocalDate date) {
        // Simple implementation using filtering
        return bookingRepository.findAllWithFilters(status, date, null, user.getId())
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings(BookingStatus status, LocalDate date, Long resourceId, Long userId) {
        return bookingRepository.findAllWithFilters(status, date, resourceId, userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(Long id, User user, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!isAdmin && !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to view this booking");
        }

        return mapToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(Long id, User admin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved");
        }

        // Run conflict check again at approval time
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                booking.getResource().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                Arrays.asList(BookingStatus.APPROVED)
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Cannot approve: Overlaps with an already APPROVED booking");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(admin);
        booking.setApprovedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(Long id, String reason, User admin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setRejectedBy(admin);
        booking.setRejectedAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id, String reason, User user, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!isAdmin && !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new RuntimeException("Booking is already in a terminal state");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledBy(user);
        booking.setCancelledAt(LocalDateTime.now());

        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public Map<String, Object> checkConflict(Long resourceId, LocalDate date, LocalTime start, LocalTime end) {
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                resourceId, date, start, end,
                Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED)
        );

        Map<String, Object> result = new HashMap<>();
        result.put("conflict", !conflicts.isEmpty());
        if (!conflicts.isEmpty()) {
            Booking c = conflicts.get(0);
            Map<String, String> existing = new HashMap<>();
            existing.put("startTime", c.getStartTime().toString());
            existing.put("endTime", c.getEndTime().toString());
            result.put("existingBooking", existing);
        }
        return result;
    }

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .resourceId(b.getResource().getId())
                .resourceName(b.getResource().getName())
                .resourceLocation(b.getResource().getLocation())
                .resourceType(b.getResource().getType())
                .userId(b.getUser().getId())
                .userName(b.getUser().getName())
                .userEmail(b.getUser().getEmail())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .expectedAttendees(b.getExpectedAttendees())
                .notes(b.getNotes())
                .status(b.getStatus())
                .rejectionReason(b.getRejectionReason())
                .cancellationReason(b.getCancellationReason())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .approvedByName(b.getApprovedBy() != null ? b.getApprovedBy().getName() : null)
                .approvedAt(b.getApprovedAt())
                .build();
    }
}
