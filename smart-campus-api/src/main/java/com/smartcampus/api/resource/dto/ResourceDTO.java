package com.smartcampus.api.resource.dto;

import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.model.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Resource response model.
 */
@Data
@Builder
public class ResourceDTO {
    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private ResourceStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
