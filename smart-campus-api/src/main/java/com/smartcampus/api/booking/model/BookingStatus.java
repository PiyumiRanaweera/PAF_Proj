package com.smartcampus.api.booking.model;

/**
 * Booking lifecycle statuses — follows workflow: PENDING → APPROVED / REJECTED; APPROVED → CANCELLED
 */
public enum BookingStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED
}
