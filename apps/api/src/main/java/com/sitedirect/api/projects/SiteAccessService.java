package com.sitedirect.api.projects;

import com.sitedirect.api.projects.Project;
import com.sitedirect.api.projects.ProjectAssignment;
import com.sitedirect.api.common.Role;
import com.sitedirect.api.projects.ProjectAssignmentRepository;
import com.sitedirect.api.projects.ProjectRepository;
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
        Project project = requireProject(projectId);
        if (project.isArchived()) {
            throw new IllegalArgumentException("Project is archived");
        }
        ProjectAssignment assignment = assignmentRepository
                .findByProjectIdAndUserId(projectId, principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Not assigned to this project"));
        if (assignment.getAssignmentRole() != Role.SITE_LEAD) {
            throw new IllegalArgumentException("Site Lead assignment required");
        }
    }
}
