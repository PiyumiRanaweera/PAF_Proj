package com.smartcampus.api.resource.service;

import com.smartcampus.api.resource.dto.ResourceRequest;
import com.smartcampus.api.resource.model.Resource;
import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.model.ResourceType;
import com.smartcampus.api.resource.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ResourceService
 * Member 1 - Facilities & Assets Catalogue testing evidence
 */
@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource resource;

    @BeforeEach
    void setUp() {
        resource = Resource.builder()
                .id(1L)
                .name("A401 Lecture Hall")
                .type(ResourceType.LECTURE_HALL)
                .capacity(120)
                .location("Main Building")
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(18, 0))
                .status(ResourceStatus.ACTIVE)
                .description("Projector included")
                .build();
    }

    @Test
    @DisplayName("Should return filtered resources")
    void shouldReturnFilteredResources() {
        when(resourceRepository.searchResources(ResourceType.LECTURE_HALL, ResourceStatus.ACTIVE, "Main", 100))
                .thenReturn(List.of(resource));

        var result = resourceService.getAllResources(ResourceType.LECTURE_HALL, ResourceStatus.ACTIVE, "Main", 100);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("A401 Lecture Hall");
    }

    @Test
    @DisplayName("Should create resource with valid availability window")
    void shouldCreateResource() {
        ResourceRequest request = new ResourceRequest();
        request.setName("Network Lab 01");
        request.setType(ResourceType.LAB);
        request.setCapacity(35);
        request.setLocation("Engineering Block");
        request.setAvailableFrom(LocalTime.of(9, 0));
        request.setAvailableTo(LocalTime.of(17, 0));
        request.setStatus(ResourceStatus.ACTIVE);
        request.setDescription("Cisco routers and managed switches");

        Resource savedResource = Resource.builder()
            .id(2L)
            .name("Network Lab 01")
            .type(ResourceType.LAB)
            .capacity(35)
            .location("Engineering Block")
            .availableFrom(LocalTime.of(9, 0))
            .availableTo(LocalTime.of(17, 0))
            .status(ResourceStatus.ACTIVE)
            .description("Cisco routers and managed switches")
            .build();

        when(resourceRepository.save(any(Resource.class))).thenReturn(savedResource);

        var created = resourceService.createResource(request);

        assertThat(created).isNotNull();
        assertThat(created.getType()).isEqualTo(ResourceType.LAB);
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    @DisplayName("Should reject invalid availability window")
    void shouldRejectInvalidAvailabilityWindow() {
        ResourceRequest request = new ResourceRequest();
        request.setName("Invalid Time Resource");
        request.setType(ResourceType.EQUIPMENT);
        request.setCapacity(1);
        request.setLocation("A Block");
        request.setAvailableFrom(LocalTime.of(18, 0));
        request.setAvailableTo(LocalTime.of(9, 0));
        request.setStatus(ResourceStatus.ACTIVE);

        assertThatThrownBy(() -> resourceService.createResource(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("availableFrom must be before availableTo");
    }

    @Test
    @DisplayName("Should throw NOT_FOUND when resource does not exist")
    void shouldThrowNotFoundWhenResourceMissing() {
        when(resourceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.getResourceById(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Resource not found with id: 99");
    }

    @Test
    @DisplayName("Should delete resource when it exists")
    void shouldDeleteResource() {
        when(resourceRepository.existsById(1L)).thenReturn(true);

        resourceService.deleteResource(1L);

        verify(resourceRepository, times(1)).deleteById(1L);
    }
}
