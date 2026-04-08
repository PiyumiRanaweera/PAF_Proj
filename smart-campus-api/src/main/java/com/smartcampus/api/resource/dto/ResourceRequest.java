package com.smartcampus.api.resource.dto;

import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.model.ResourceType;
import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalTime;

/**
 * Request payload for creating or updating resources.
 */
@Data
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Available from time is required")
    private LocalTime availableFrom;

    @NotNull(message = "Available to time is required")
    private LocalTime availableTo;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private String description;
}
