package com.sitedirect.api.repo;

import com.sitedirect.api.domain.ProjectAssignment;
import com.sitedirect.api.domain.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, UUID> {
    List<ProjectAssignment> findByProjectId(UUID projectId);

    Optional<ProjectAssignment> findByProjectIdAndUserId(UUID projectId, UUID userId);

    Optional<ProjectAssignment> findByProjectIdAndAssignmentRole(UUID projectId, Role assignmentRole);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);
}
