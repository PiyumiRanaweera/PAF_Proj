package com.smartcampus.api.resource.dto;

import com.smartcampus.api.resource.model.ResourceStatus;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * Request payload for updating only the status field.
 */
@Data
public class ResourceStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ResourceStatus status;
}
