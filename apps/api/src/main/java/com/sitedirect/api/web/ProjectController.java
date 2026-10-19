package com.sitedirect.api.web;

import com.sitedirect.api.service.ProjectService;
import com.sitedirect.api.web.dto.ProjectDtos.AssignmentRequest;
import com.sitedirect.api.web.dto.ProjectDtos.AssignmentResponse;
import com.sitedirect.api.web.dto.ProjectDtos.CreateProjectRequest;
import com.sitedirect.api.web.dto.ProjectDtos.MilestoneRequest;
import com.sitedirect.api.web.dto.ProjectDtos.MilestoneResponse;
import com.sitedirect.api.web.dto.ProjectDtos.ProgressLinkResponse;
import com.sitedirect.api.web.dto.ProjectDtos.ProjectResponse;
import com.sitedirect.api.web.dto.ProjectDtos.ProjectSummaryResponse;
import com.sitedirect.api.web.dto.ProjectDtos.UpdateProjectRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
@PreAuthorize("hasRole('ADMIN')")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectSummaryResponse> list() {
        return projectService.listProjects();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse create(@Valid @RequestBody CreateProjectRequest request) {
        return projectService.createProject(request);
    }

    @GetMapping("/{id}")
    public ProjectResponse get(@PathVariable UUID id) {
        return projectService.getProject(id);
    }

    @PutMapping("/{id}")
    public ProjectResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateProjectRequest request) {
        return projectService.updateProject(id, request);
    }

    @GetMapping("/{id}/milestones")
    public List<MilestoneResponse> milestones(@PathVariable UUID id) {
        return projectService.listMilestones(id);
    }

    @PostMapping("/{id}/milestones")
    @ResponseStatus(HttpStatus.CREATED)
    public MilestoneResponse addMilestone(@PathVariable UUID id, @Valid @RequestBody MilestoneRequest request) {
        return projectService.addMilestone(id, request);
    }

    @PostMapping("/{id}/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    public AssignmentResponse assign(@PathVariable UUID id, @Valid @RequestBody AssignmentRequest request) {
        return projectService.assign(id, request);
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeAssignment(@PathVariable UUID id, @PathVariable UUID assignmentId) {
        projectService.removeAssignment(id, assignmentId);
    }

    @GetMapping("/{id}/progress-link")
    public ProgressLinkResponse progressLink(@PathVariable UUID id) {
        return projectService.progressLink(id);
    }
}
