package com.smartcampus.api.resource.controller;

import com.smartcampus.api.resource.dto.ResourceDTO;
import com.smartcampus.api.resource.dto.ResourceRequest;
import com.smartcampus.api.resource.dto.ResourceStatusUpdateRequest;
import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.model.ResourceType;
import com.smartcampus.api.resource.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * Facilities and assets catalogue endpoints.
 * Member 1 module implementation.
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * GET /api/resources?type=&status=&location=&minCapacity=
     */
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity
    ) {
        return ResponseEntity.ok(resourceService.getAllResources(type, status, location, minCapacity));
    }

    /**
     * GET /api/resources/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    /**
     * POST /api/resources
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> createResource(@RequestBody @Valid ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    /**
     * PUT /api/resources/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateResource(@PathVariable Long id, @RequestBody @Valid ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    /**
     * PATCH /api/resources/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateResourceStatus(
            @PathVariable Long id,
            @RequestBody @Valid ResourceStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, request.getStatus()));
    }

    /**
     * DELETE /api/resources/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
