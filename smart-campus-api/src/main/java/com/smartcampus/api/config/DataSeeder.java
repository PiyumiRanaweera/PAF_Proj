package com.smartcampus.api.config;

import com.smartcampus.api.resource.model.Resource;
import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ResourceRepository resourceRepository;
    private final com.smartcampus.api.user.repository.UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Users
        if (userRepository.count() == 0) {
            userRepository.save(com.smartcampus.api.user.model.User.builder()
                    .name("Test Student")
                    .email("test@smartcampus.edu")
                    .isActive(true)
                    .roles(new java.util.HashSet<>(java.util.Arrays.asList(com.smartcampus.api.user.model.Role.USER)))
                    .build());

            userRepository.save(com.smartcampus.api.user.model.User.builder()
                    .name("Admin Admin")
                    .email("admin@smartcampus.edu")
                    .isActive(true)
                    .roles(new java.util.HashSet<>(java.util.Arrays.asList(com.smartcampus.api.user.model.Role.USER, com.smartcampus.api.user.model.Role.ADMIN)))
                    .build());
        }

        // Seed Resources
        if (resourceRepository.count() == 0) {
            resourceRepository.save(Resource.builder()
                    .name("Main Lecture Hall")
                    .type("LECTURE_HALL")
                    .location("Block A, Level 1")
                    .capacity(200)
                    .status(ResourceStatus.ACTIVE)
                    .availabilityWindows("Mon-Fri 08:00-20:00")
                    .description("Largest hall on campus with modern AV equipment.")
                    .build());

            resourceRepository.save(Resource.builder()
                    .name("Computing Lab 01")
                    .type("LAB")
                    .location("Block C, Level 2")
                    .capacity(30)
                    .status(ResourceStatus.ACTIVE)
                    .availabilityWindows("Mon-Fri 09:00-17:00")
                    .description("Equipped with high-end workstations.")
                    .build());

            resourceRepository.save(Resource.builder()
                    .name("Meeting Room A")
                    .type("MEETING_ROOM")
                    .location("Block B, Level 1")
                    .capacity(12)
                    .status(ResourceStatus.ACTIVE)
                    .availabilityWindows("Mon-Fri 08:00-18:00")
                    .description("Equipped with video conferencing tools.")
                    .build());

            resourceRepository.save(Resource.builder()
                    .name("Sony 4K Projector Pro")
                    .type("EQUIPMENT")
                    .location("AV Store - Central")
                    .capacity(1)
                    .status(ResourceStatus.ACTIVE)
                    .availabilityWindows("Daily 08:00-17:00")
                    .description("High-definition projector for events.")
                    .build());

            resourceRepository.save(Resource.builder()
                    .name("Logitech Rally Camera")
                    .type("EQUIPMENT")
                    .location("IT Support Desk")
                    .capacity(1)
                    .status(ResourceStatus.ACTIVE)
                    .availabilityWindows("Daily 09:00-17:00")
                    .description("Premium PTZ camera for web conferencing.")
                    .build());

            resourceRepository.save(Resource.builder()
                    .name("Outdoor Amphitheater")
                    .type("OTHER")
                    .location("Central Square")
                    .capacity(500)
                    .status(ResourceStatus.INACTIVE)
                    .availabilityWindows("All day")
                    .description("Currently under maintenance.")
                    .build());
        }
    }
}
