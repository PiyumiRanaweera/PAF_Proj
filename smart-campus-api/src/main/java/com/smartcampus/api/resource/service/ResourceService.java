package com.smartcampus.api.resource.service;

import com.smartcampus.api.resource.dto.ResourceDTO;
import com.smartcampus.api.resource.dto.ResourceRequest;
import com.smartcampus.api.resource.model.Resource;
import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.model.ResourceType;
import com.smartcampus.api.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for facilities and assets catalogue operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<ResourceDTO> getAllResources(ResourceType type, ResourceStatus status, String location, Integer minCapacity) {
        return resourceRepository.searchResources(type, status, location, minCapacity)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found with id: " + id));
        return mapToDTO(resource);
    }

    @Transactional
    public ResourceDTO createResource(ResourceRequest request) {
        validateAvailabilityWindow(request);

        Resource resource = Resource.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation().trim())
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .status(request.getStatus())
                .description(request.getDescription())
                .build();

        Resource saved = resourceRepository.save(resource);
        log.info("Created resource {} ({})", saved.getName(), saved.getId());
        return mapToDTO(saved);
    }

    @Transactional
    public ResourceDTO updateResource(Long id, ResourceRequest request) {
        validateAvailabilityWindow(request);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found with id: " + id));

        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setStatus(request.getStatus());
        resource.setDescription(request.getDescription());

        Resource updated = resourceRepository.save(resource);
        log.info("Updated resource {} ({})", updated.getName(), updated.getId());
        return mapToDTO(updated);
    }

    @Transactional
    public ResourceDTO updateResourceStatus(Long id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found with id: " + id));

        resource.setStatus(status);
        Resource updated = resourceRepository.save(resource);
        log.info("Updated resource status {} -> {}", updated.getId(), status);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
        log.info("Deleted resource {}", id);
    }

    private void validateAvailabilityWindow(ResourceRequest request) {
        if (!request.getAvailableFrom().isBefore(request.getAvailableTo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "availableFrom must be before availableTo");
        }
    }

    private ResourceDTO mapToDTO(Resource resource) {
        return ResourceDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .availableFrom(resource.getAvailableFrom())
                .availableTo(resource.getAvailableTo())
                .status(resource.getStatus())
                .description(resource.getDescription())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
