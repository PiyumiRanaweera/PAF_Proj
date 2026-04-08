package com.smartcampus.api.booking.controller;

import com.smartcampus.api.booking.dto.BookingResponse;
import com.smartcampus.api.booking.model.BookingStatus;
import com.smartcampus.api.booking.service.BookingService;
import com.smartcampus.api.user.model.User;
import com.smartcampus.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, bookingDate, resourceId, userId));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User admin = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.approveBooking(id, admin));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User admin = getCurrentUser(userDetails);
        String reason = body.get("rejectionReason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason, admin));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> adminCancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User admin = getCurrentUser(userDetails);
        String reason = body.get("cancellationReason");
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason, admin, true));
    }

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
