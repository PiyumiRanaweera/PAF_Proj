package com.smartcampus.api.resource.controller;

import com.smartcampus.api.resource.model.Resource;
import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) ResourceStatus status) {
        if (status != null) {
            return ResponseEntity.ok(resourceRepository.findByStatus(status));
        }
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        return ResponseEntity.ok(resourceRepository.save(resource));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource details) {
        return resourceRepository.findById(id).map(resource -> {
            resource.setName(details.getName());
            resource.setType(details.getType());
            resource.setLocation(details.getLocation());
            resource.setCapacity(details.getCapacity());
            resource.setStatus(details.getStatus());
            resource.setAvailabilityWindows(details.getAvailabilityWindows());
            resource.setDescription(details.getDescription());
            return ResponseEntity.ok(resourceRepository.save(resource));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        if (!resourceRepository.existsById(id)) return ResponseEntity.notFound().build();
        // Option: Instead of hard delete, we could set status to INACTIVE if bookings exist.
        // For now, doing hard delete as requested for "catalogue maintenance".
        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
