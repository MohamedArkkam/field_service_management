package com.sitedirect.api.projects;

import com.sitedirect.api.projects.ProjectAssignment;
import com.sitedirect.api.common.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, UUID> {
    List<ProjectAssignment> findByProjectId(UUID projectId);

    Optional<ProjectAssignment> findByProjectIdAndUserId(UUID projectId, UUID userId);

    Optional<ProjectAssignment> findByProjectIdAndAssignmentRole(UUID projectId, Role assignmentRole);

    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);

    List<ProjectAssignment> findByUserId(UUID userId);
}
