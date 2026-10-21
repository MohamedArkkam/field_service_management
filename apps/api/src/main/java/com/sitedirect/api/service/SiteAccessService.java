package com.sitedirect.api.service;

import com.sitedirect.api.domain.Project;
import com.sitedirect.api.domain.ProjectAssignment;
import com.sitedirect.api.domain.Role;
import com.sitedirect.api.repo.ProjectAssignmentRepository;
import com.sitedirect.api.repo.ProjectRepository;
import com.sitedirect.api.security.UserPrincipal;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class SiteAccessService {

    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;

    public SiteAccessService(ProjectRepository projectRepository, ProjectAssignmentRepository assignmentRepository) {
        this.projectRepository = projectRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public Project requireProject(UUID projectId) {
        return projectRepository
                .findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    public void requireAssignedSiteLead(UUID projectId, UserPrincipal principal) {
        if (principal.getRole() != Role.SITE_LEAD) {
            throw new IllegalArgumentException("Site Lead role required");
        }
        requireProject(projectId);
        ProjectAssignment assignment = assignmentRepository
                .findByProjectIdAndUserId(projectId, principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Not assigned to this project"));
        if (assignment.getAssignmentRole() != Role.SITE_LEAD) {
            throw new IllegalArgumentException("Site Lead assignment required");
        }
    }
}
