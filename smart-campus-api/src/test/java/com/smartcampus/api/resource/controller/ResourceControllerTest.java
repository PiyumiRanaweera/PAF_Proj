package com.smartcampus.api.resource.controller;

import com.smartcampus.api.resource.dto.ResourceDTO;
import com.smartcampus.api.resource.dto.ResourceRequest;
import com.smartcampus.api.resource.dto.ResourceStatusUpdateRequest;
import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.model.ResourceType;
import com.smartcampus.api.resource.service.ResourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ResourceController
 * Member 1 - endpoint behavior evidence for Module A
 */
@ExtendWith(MockitoExtension.class)
class ResourceControllerTest {

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private ResourceController resourceController;

    private ResourceDTO resourceDTO;

    @BeforeEach
    void setUp() {
        resourceDTO = ResourceDTO.builder()
                .id(1L)
                .name("A401 Lecture Hall")
                .type(ResourceType.LECTURE_HALL)
                .capacity(120)
                .location("Main Building")
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(18, 0))
                .status(ResourceStatus.ACTIVE)
                .description("Projector available")
                .build();
    }

    @Test
    @DisplayName("GET /api/resources/metadata should return resource enums")
    void getResourceMetadataShouldReturnEnums() {
        ResponseEntity<Map<String, List<String>>> response = resourceController.getResourceMetadata();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("types")).contains("LECTURE_HALL", "LAB");
        assertThat(response.getBody().get("statuses")).contains("ACTIVE", "OUT_OF_SERVICE");
    }

    @Test
    @DisplayName("GET /api/resources should return filtered list")
    void getAllResourcesShouldReturnList() {
        when(resourceService.getAllResources(
            ResourceType.LECTURE_HALL,
            ResourceStatus.ACTIVE,
            "A401",
            "Main",
            100,
            "name",
            "asc"
        ))
                .thenReturn(List.of(resourceDTO));

        ResponseEntity<List<ResourceDTO>> response =
            resourceController.getAllResources(
                ResourceType.LECTURE_HALL,
                ResourceStatus.ACTIVE,
                "A401",
                "Main",
                100,
                "name",
                "asc"
            );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getName()).isEqualTo("A401 Lecture Hall");
    }

    @Test
    @DisplayName("GET /api/resources/{id} should return one resource")
    void getResourceByIdShouldReturnResource() {
        when(resourceService.getResourceById(1L)).thenReturn(resourceDTO);

        ResponseEntity<ResourceDTO> response = resourceController.getResourceById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("POST /api/resources should return CREATED")
    void createResourceShouldReturnCreated() {
        ResourceRequest request = new ResourceRequest();
        request.setName("Lab 1");
        request.setType(ResourceType.LAB);
        request.setCapacity(40);
        request.setLocation("Engineering Block");
        request.setAvailableFrom(LocalTime.of(9, 0));
        request.setAvailableTo(LocalTime.of(17, 0));
        request.setStatus(ResourceStatus.ACTIVE);

        when(resourceService.createResource(any(ResourceRequest.class))).thenReturn(resourceDTO);

        ResponseEntity<ResourceDTO> response = resourceController.createResource(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        verify(resourceService, times(1)).createResource(any(ResourceRequest.class));
    }

    @Test
    @DisplayName("PUT /api/resources/{id} should return updated resource")
    void updateResourceShouldReturnUpdatedResource() {
        ResourceRequest request = new ResourceRequest();
        request.setName("Updated Lab");
        request.setType(ResourceType.LAB);
        request.setCapacity(45);
        request.setLocation("Engineering Block");
        request.setAvailableFrom(LocalTime.of(8, 30));
        request.setAvailableTo(LocalTime.of(17, 30));
        request.setStatus(ResourceStatus.ACTIVE);

        when(resourceService.updateResource(eq(1L), any(ResourceRequest.class))).thenReturn(resourceDTO);

        ResponseEntity<ResourceDTO> response = resourceController.updateResource(1L, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        verify(resourceService, times(1)).updateResource(eq(1L), any(ResourceRequest.class));
    }

    @Test
    @DisplayName("PATCH /api/resources/{id}/status should return updated status")
    void updateResourceStatusShouldReturnUpdatedResource() {
        ResourceStatusUpdateRequest request = new ResourceStatusUpdateRequest();
        request.setStatus(ResourceStatus.OUT_OF_SERVICE);

        ResourceDTO updated = ResourceDTO.builder()
                .id(resourceDTO.getId())
                .name(resourceDTO.getName())
                .type(resourceDTO.getType())
                .capacity(resourceDTO.getCapacity())
                .location(resourceDTO.getLocation())
                .availableFrom(resourceDTO.getAvailableFrom())
                .availableTo(resourceDTO.getAvailableTo())
                .status(ResourceStatus.OUT_OF_SERVICE)
                .description(resourceDTO.getDescription())
                .build();

        when(resourceService.updateResourceStatus(1L, ResourceStatus.OUT_OF_SERVICE)).thenReturn(updated);

        ResponseEntity<ResourceDTO> response = resourceController.updateResourceStatus(1L, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(ResourceStatus.OUT_OF_SERVICE);
    }

    @Test
    @DisplayName("DELETE /api/resources/{id} should return NO_CONTENT")
    void deleteResourceShouldReturnNoContent() {
        doNothing().when(resourceService).deleteResource(1L);

        ResponseEntity<Void> response = resourceController.deleteResource(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(resourceService, times(1)).deleteResource(1L);
    }
}
