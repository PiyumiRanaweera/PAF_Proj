package com.smartcampus.api.resource.repository;

import com.smartcampus.api.resource.model.Resource;
import com.smartcampus.api.resource.model.ResourceStatus;
import com.smartcampus.api.resource.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query("SELECT r FROM Resource r " +
            "WHERE (:type IS NULL OR r.type = :type) " +
            "AND (:status IS NULL OR r.status = :status) " +
            "AND (:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:minCapacity IS NULL OR r.capacity >= :minCapacity) " +
            "ORDER BY r.createdAt DESC")
    List<Resource> searchResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("name") String name,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity
    );
}
