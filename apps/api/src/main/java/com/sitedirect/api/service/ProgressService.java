package com.sitedirect.api.service;

import com.sitedirect.api.domain.Milestone;
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
import com.sitedirect.api.security.UserPrincipal;
import com.sitedirect.api.web.dto.ProgressDtos.ClientProgressItem;
import com.sitedirect.api.web.dto.ProgressDtos.ClientProgressResponse;
import com.sitedirect.api.web.dto.ProgressDtos.CreateProgressRequest;
import com.sitedirect.api.web.dto.ProgressDtos.ProgressUpdateResponse;
import com.sitedirect.api.web.dto.ProgressDtos.PublishProgressRequest;
import com.sitedirect.api.web.dto.ProgressDtos.SiteProjectSummary;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {

    private final ProgressUpdateRepository progressUpdateRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final MilestoneRepository milestoneRepository;
    private final UserAccountRepository userAccountRepository;

    public ProgressService(
            ProgressUpdateRepository progressUpdateRepository,
            ProjectRepository projectRepository,
            ProjectAssignmentRepository assignmentRepository,
            MilestoneRepository milestoneRepository,
            UserAccountRepository userAccountRepository) {
        this.progressUpdateRepository = progressUpdateRepository;
        this.projectRepository = projectRepository;
        this.assignmentRepository = assignmentRepository;
        this.milestoneRepository = milestoneRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public List<SiteProjectSummary> listSiteLeadProjects(UserPrincipal principal) {
        requireSiteLead(principal);
        return assignmentRepository.findByUserId(principal.getId()).stream()
                .filter(a -> a.getAssignmentRole() == Role.SITE_LEAD)
                .map(a -> projectRepository.findById(a.getProjectId()).orElse(null))
                .filter(p -> p != null && !p.isArchived())
                .map(p -> new SiteProjectSummary(
                        p.getId(),
                        p.getName(),
                        p.getLocation(),
                        p.getClientDisplayName(),
                        "/p/" + p.getProgressToken()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProgressUpdateResponse> listForSiteLead(UUID projectId, UserPrincipal principal) {
        requireAssignedSiteLead(projectId, principal);
        return mapResponses(progressUpdateRepository.findByProjectIdOrderByCreatedAtDesc(projectId));
    }

    @Transactional(readOnly = true)
    public List<ProgressUpdateResponse> listForAdmin(UUID projectId) {
        requireProject(projectId);
        return mapResponses(progressUpdateRepository.findByProjectIdOrderByCreatedAtDesc(projectId));
    }

    @Transactional
    public ProgressUpdateResponse createDraft(UUID projectId, CreateProgressRequest request, UserPrincipal principal) {
        requireAssignedSiteLead(projectId, principal);
        ProgressUpdate update = new ProgressUpdate(
                UUID.randomUUID(), projectId, request.title().trim(), principal.getId());
        update.setNote(trimToNull(request.note()));
        update.setPhotoUrl(trimToNull(request.photoUrl()));
        if (request.milestoneId() != null) {
            Milestone milestone = milestoneRepository
                    .findById(request.milestoneId())
                    .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
            if (!milestone.getProjectId().equals(projectId)) {
                throw new IllegalArgumentException("Milestone does not belong to project");
            }
            update.setMilestoneId(milestone.getId());
        }
        progressUpdateRepository.save(update);
        requireProject(projectId).touch();
        return toResponse(update, milestoneName(update.getMilestoneId()));
    }

    @Transactional
    public ProgressUpdateResponse publish(
            UUID projectId, UUID progressId, PublishProgressRequest request, UserPrincipal principal) {
        requireAssignedSiteLead(projectId, principal);
        ProgressUpdate update = requireProgressOnProject(projectId, progressId);
        update.publish(request.rating());
        requireProject(projectId).touch();
        return toResponse(update, milestoneName(update.getMilestoneId()));
    }

    @Transactional
    public void deleteDraftForSiteLead(UUID projectId, UUID progressId, UserPrincipal principal) {
        requireAssignedSiteLead(projectId, principal);
        deleteDraft(projectId, progressId);
    }

    @Transactional
    public void deleteDraftForAdmin(UUID projectId, UUID progressId) {
        requireProject(projectId);
        deleteDraft(projectId, progressId);
    }

    private void deleteDraft(UUID projectId, UUID progressId) {
        ProgressUpdate update = requireProgressOnProject(projectId, progressId);
        if (update.getStatus() != ProgressStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT progress can be deleted");
        }
        progressUpdateRepository.delete(update);
        requireProject(projectId).touch();
    }

    private ProgressUpdate requireProgressOnProject(UUID projectId, UUID progressId) {
        ProgressUpdate update = progressUpdateRepository
                .findById(progressId)
                .orElseThrow(() -> new IllegalArgumentException("Progress update not found"));
        if (!update.getProjectId().equals(projectId)) {
            throw new IllegalArgumentException("Progress update does not belong to project");
        }
        return update;
    }

    @Transactional(readOnly = true)
    public ClientProgressResponse clientProgress(String token) {
        Project project = projectRepository
                .findByProgressToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or unknown progress link"));
        List<ClientProgressItem> items = progressUpdateRepository
                .findByProjectIdAndStatusOrderByPublishedAtDesc(project.getId(), ProgressStatus.PUBLISHED)
                .stream()
                .map(u -> new ClientProgressItem(
                        u.getId(),
                        u.getTitle(),
                        u.getNote(),
                        u.getPhotoUrl(),
                        milestoneName(u.getMilestoneId()),
                        u.getRating(),
                        u.getPublishedAt()))
                .toList();
        return new ClientProgressResponse(
                project.getName(), project.getClientDisplayName(), project.getLocation(), items);
    }

    private void requireSiteLead(UserPrincipal principal) {
        if (principal.getRole() != Role.SITE_LEAD) {
            throw new IllegalArgumentException("Site Lead role required");
        }
        UserAccount user = userAccountRepository
                .findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!user.isActive()) {
            throw new IllegalArgumentException("User is inactive");
        }
    }

    private void requireAssignedSiteLead(UUID projectId, UserPrincipal principal) {
        requireSiteLead(principal);
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

    private Project requireProject(UUID id) {
        return projectRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    private List<ProgressUpdateResponse> mapResponses(List<ProgressUpdate> updates) {
        Map<UUID, Milestone> milestones = updates.stream()
                .map(ProgressUpdate::getMilestoneId)
                .filter(id -> id != null)
                .distinct()
                .map(id -> milestoneRepository.findById(id).orElse(null))
                .filter(m -> m != null)
                .collect(Collectors.toMap(Milestone::getId, Function.identity(), (a, b) -> a));
        return updates.stream()
                .map(u -> toResponse(
                        u, u.getMilestoneId() == null ? null : milestones.get(u.getMilestoneId()) == null
                                ? null
                                : milestones.get(u.getMilestoneId()).getName()))
                .toList();
    }

    private String milestoneName(UUID milestoneId) {
        if (milestoneId == null) {
            return null;
        }
        return milestoneRepository.findById(milestoneId).map(Milestone::getName).orElse(null);
    }

    private ProgressUpdateResponse toResponse(ProgressUpdate update, String milestoneName) {
        return new ProgressUpdateResponse(
                update.getId(),
                update.getProjectId(),
                update.getMilestoneId(),
                milestoneName,
                update.getTitle(),
                update.getNote(),
                update.getPhotoUrl(),
                update.getStatus(),
                update.getRating(),
                update.getCreatedAt(),
                update.getPublishedAt());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
