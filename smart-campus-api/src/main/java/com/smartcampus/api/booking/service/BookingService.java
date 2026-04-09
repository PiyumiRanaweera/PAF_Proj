package com.smartcampus.api.booking.service;

import com.smartcampus.api.booking.dto.BookingRequest;
import com.smartcampus.api.booking.dto.BookingResponse;
import com.smartcampus.api.booking.model.BookingStatus;
import com.smartcampus.api.user.model.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, User user);
    
    List<BookingResponse> getMyBookings(User user, BookingStatus status, LocalDate date);
    
    List<BookingResponse> getAllBookings(BookingStatus status, LocalDate date, Long resourceId, Long userId);
    
    BookingResponse getBookingById(Long id, User user, boolean isAdmin);
    
    BookingResponse approveBooking(Long id, User admin);
    
    BookingResponse rejectBooking(Long id, String reason, User admin);
    
    BookingResponse cancelBooking(Long id, String reason, User user, boolean isAdmin);
    
    Map<String, Object> checkConflict(Long resourceId, LocalDate date, java.time.LocalTime start, java.time.LocalTime end);
}
