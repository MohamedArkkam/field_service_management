package com.sitedirect.api.service;

import com.sitedirect.api.domain.Milestone;
import com.sitedirect.api.domain.Priority;
import com.sitedirect.api.domain.ProgressStatus;
import com.sitedirect.api.domain.ProgressUpdate;
import com.sitedirect.api.domain.Project;
import com.sitedirect.api.domain.ProjectAssignment;
import com.sitedirect.api.domain.Role;
import com.sitedirect.api.domain.UserAccount;
import com.sitedirect.api.repo.MilestoneRepository;
import com.sitedirect.api.repo.ProgressUpdateRepository;
import com.sitedirect.api.repo.ProjectAssignmentRepository;
import com.sitedirect.api.repo.ProjectRepository;
import com.sitedirect.api.repo.UserAccountRepository;
import com.sitedirect.api.web.dto.ProjectDtos.AssignmentRequest;
import com.sitedirect.api.web.dto.ProjectDtos.AssignmentResponse;
import com.sitedirect.api.web.dto.ProjectDtos.CreateProjectRequest;
import com.sitedirect.api.web.dto.ProjectDtos.MilestoneRequest;
import com.sitedirect.api.web.dto.ProjectDtos.MilestoneResponse;
import com.sitedirect.api.web.dto.ProjectDtos.ProgressLinkResponse;
import com.sitedirect.api.web.dto.ProjectDtos.ProjectResponse;
import com.sitedirect.api.web.dto.ProjectDtos.ProjectSummaryResponse;
import com.sitedirect.api.web.dto.ProjectDtos.UpdateProjectRequest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final UserAccountRepository userAccountRepository;
    private final ProgressUpdateRepository progressUpdateRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            MilestoneRepository milestoneRepository,
            ProjectAssignmentRepository assignmentRepository,
            UserAccountRepository userAccountRepository,
            ProgressUpdateRepository progressUpdateRepository) {
        this.projectRepository = projectRepository;
        this.milestoneRepository = milestoneRepository;
        this.assignmentRepository = assignmentRepository;
        this.userAccountRepository = userAccountRepository;
        this.progressUpdateRepository = progressUpdateRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> listProjects() {
        Map<UUID, CompletionSignal> signals = buildCompletionSignals();
        return projectRepository.findAll().stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .map(p -> toSummary(p, signals.getOrDefault(p.getId(), CompletionSignal.EMPTY)))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID id) {
        return toDetail(requireProject(id));
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        Project project = new Project(UUID.randomUUID(), request.name().trim(), newProgressToken());
        project.setLocation(trimToNull(request.location()));
        project.setClientDisplayName(trimToNull(request.clientDisplayName()));
        project.setPriority(request.priority() == null ? Priority.MEDIUM : request.priority());
        project.setProjectValue(request.projectValue());
        project.setStrategicNote(trimToNull(request.strategicNote()));
        projectRepository.save(project);
        return toDetail(project);
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request) {
        Project project = requireProject(id);
        project.setName(request.name().trim());
        project.setLocation(trimToNull(request.location()));
        project.setClientDisplayName(trimToNull(request.clientDisplayName()));
        project.setPriority(request.priority());
        project.setProjectValue(request.projectValue());
        project.setStrategicNote(trimToNull(request.strategicNote()));
        project.touch();
        return toDetail(project);
    }

    @Transactional
    public MilestoneResponse addMilestone(UUID projectId, MilestoneRequest request) {
        requireProject(projectId);
        int sort = request.sortOrder() == null
                ? milestoneRepository.findByProjectIdOrderBySortOrderAscCreatedAtAsc(projectId).size()
                : request.sortOrder();
        Milestone milestone = new Milestone(
                UUID.randomUUID(),
                projectId,
                trimToNull(request.phaseName()),
                request.name().trim(),
                sort);
        milestoneRepository.save(milestone);
        return toMilestone(milestone);
    }

    @Transactional(readOnly = true)
    public List<MilestoneResponse> listMilestones(UUID projectId) {
        requireProject(projectId);
        return milestoneRepository.findByProjectIdOrderBySortOrderAscCreatedAtAsc(projectId).stream()
                .map(this::toMilestone)
                .toList();
    }

    @Transactional
    public AssignmentResponse assign(UUID projectId, AssignmentRequest request) {
        requireProject(projectId);
        if (request.assignmentRole() != Role.SITE_LEAD && request.assignmentRole() != Role.CLIENT) {
            throw new IllegalArgumentException("assignmentRole must be SITE_LEAD or CLIENT");
        }
        UserAccount user = userAccountRepository
                .findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() != request.assignmentRole()) {
            throw new IllegalArgumentException("User role must match assignmentRole");
        }
        assignmentRepository
                .findByProjectIdAndAssignmentRole(projectId, request.assignmentRole())
                .ifPresent(existing -> {
                    if (!existing.getUserId().equals(user.getId())) {
                        assignmentRepository.delete(existing);
                    }
                });
        assignmentRepository.findByProjectIdAndUserId(projectId, user.getId()).ifPresent(assignmentRepository::delete);
        ProjectAssignment assignment = assignmentRepository.save(
                new ProjectAssignment(UUID.randomUUID(), projectId, user.getId(), request.assignmentRole()));
        requireProject(projectId).touch();
        return toAssignment(assignment, user);
    }

    @Transactional
    public void removeAssignment(UUID projectId, UUID assignmentId) {
        requireProject(projectId);
        ProjectAssignment assignment = assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        if (!assignment.getProjectId().equals(projectId)) {
            throw new IllegalArgumentException("Assignment does not belong to project");
        }
        assignmentRepository.delete(assignment);
        requireProject(projectId).touch();
    }

    @Transactional(readOnly = true)
    public ProgressLinkResponse progressLink(UUID projectId) {
        Project project = requireProject(projectId);
        String path = "/p/" + project.getProgressToken();
        return new ProgressLinkResponse(
                project.getProgressToken(), path, "http://localhost:5174" + path);
    }

    private Project requireProject(UUID id) {
        return projectRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    private ProjectSummaryResponse toSummary(Project project, CompletionSignal signal) {
        return new ProjectSummaryResponse(
                project.getId(),
                project.getName(),
                project.getLocation(),
                project.getPriority(),
                project.getProjectValue(),
                "/p/" + project.getProgressToken(),
                project.getUpdatedAt(),
                signal.milestoneCount(),
                signal.milestonesWithPublishedProof(),
                signal.publishedUpdateCount(),
                signal.lastPublishedAt());
    }

    /**
     * Honest portfolio signal: distinct milestones that have ≥1 PUBLISHED update,
     * plus published-update count / last publish time (no stored % complete).
     */
    private Map<UUID, CompletionSignal> buildCompletionSignals() {
        Map<UUID, Integer> milestoneCounts = new HashMap<>();
        for (Milestone milestone : milestoneRepository.findAll()) {
            milestoneCounts.merge(milestone.getProjectId(), 1, Integer::sum);
        }

        Map<UUID, Integer> publishedCounts = new HashMap<>();
        Map<UUID, Instant> lastPublished = new HashMap<>();
        Map<UUID, Set<UUID>> milestonesWithProof = new HashMap<>();

        for (ProgressUpdate update : progressUpdateRepository.findByStatus(ProgressStatus.PUBLISHED)) {
            UUID projectId = update.getProjectId();
            publishedCounts.merge(projectId, 1, Integer::sum);
            Instant publishedAt = update.getPublishedAt();
            if (publishedAt != null) {
                lastPublished.merge(projectId, publishedAt, (a, b) -> a.isAfter(b) ? a : b);
            }
            if (update.getMilestoneId() != null) {
                milestonesWithProof.computeIfAbsent(projectId, id -> new HashSet<>()).add(update.getMilestoneId());
            }
        }

        Set<UUID> projectIds = new HashSet<>();
        projectIds.addAll(milestoneCounts.keySet());
        projectIds.addAll(publishedCounts.keySet());

        Map<UUID, CompletionSignal> signals = new HashMap<>();
        for (UUID projectId : projectIds) {
            int milestones = milestoneCounts.getOrDefault(projectId, 0);
            int withProof = milestonesWithProof.getOrDefault(projectId, Set.of()).size();
            signals.put(
                    projectId,
                    new CompletionSignal(
                            milestones,
                            withProof,
                            publishedCounts.getOrDefault(projectId, 0),
                            lastPublished.get(projectId)));
        }
        return signals;
    }

    private record CompletionSignal(
            int milestoneCount,
            int milestonesWithPublishedProof,
            int publishedUpdateCount,
            Instant lastPublishedAt) {
        static final CompletionSignal EMPTY = new CompletionSignal(0, 0, 0, null);
    }

    private ProjectResponse toDetail(Project project) {
        List<MilestoneResponse> milestones = milestoneRepository
                .findByProjectIdOrderBySortOrderAscCreatedAtAsc(project.getId())
                .stream()
                .map(this::toMilestone)
                .toList();
        List<AssignmentResponse> assignments = assignmentRepository.findByProjectId(project.getId()).stream()
                .map(a -> {
                    UserAccount user = userAccountRepository
                            .findById(a.getUserId())
                            .orElseThrow(() -> new IllegalArgumentException("Assigned user missing"));
                    return toAssignment(a, user);
                })
                .toList();
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getLocation(),
                project.getClientDisplayName(),
                project.getPriority(),
                project.getProjectValue(),
                project.getStrategicNote(),
                project.getProgressToken(),
                "/p/" + project.getProgressToken(),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                milestones,
                assignments);
    }

    private MilestoneResponse toMilestone(Milestone milestone) {
        return new MilestoneResponse(
                milestone.getId(),
                milestone.getProjectId(),
                milestone.getPhaseName(),
                milestone.getName(),
                milestone.getSortOrder(),
                milestone.getCreatedAt());
    }

    private AssignmentResponse toAssignment(ProjectAssignment assignment, UserAccount user) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getProjectId(),
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                assignment.getAssignmentRole());
    }

    private String newProgressToken() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
