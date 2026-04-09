package com.smartcampus.api.resource.repository;

import com.smartcampus.api.resource.model.Resource;
import com.smartcampus.api.resource.model.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByStatus(ResourceStatus status);
}
