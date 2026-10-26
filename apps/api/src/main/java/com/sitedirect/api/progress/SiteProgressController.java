package com.sitedirect.api.progress;

import com.sitedirect.api.security.UserPrincipal;
import com.sitedirect.api.progress.ProgressService;
import com.sitedirect.api.progress.ProgressDtos.CreateProgressRequest;
import com.sitedirect.api.progress.ProgressDtos.ProgressUpdateResponse;
import com.sitedirect.api.progress.ProgressDtos.PublishProgressRequest;
import com.sitedirect.api.progress.ProgressDtos.SiteProjectSummary;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site")
@PreAuthorize("hasRole('SITE_LEAD')")
public class SiteProgressController {

    private final ProgressService progressService;

    public SiteProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/projects")
    public List<SiteProjectSummary> myProjects(@AuthenticationPrincipal UserPrincipal principal) {
        return progressService.listSiteLeadProjects(principal);
    }

    @GetMapping("/projects/{projectId}/progress")
    public List<ProgressUpdateResponse> list(
            @PathVariable UUID projectId, @AuthenticationPrincipal UserPrincipal principal) {
        return progressService.listForSiteLead(projectId, principal);
    }

    @PostMapping("/projects/{projectId}/progress")
    @ResponseStatus(HttpStatus.CREATED)
    public ProgressUpdateResponse create(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateProgressRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return progressService.createDraft(projectId, request, principal);
    }

    @PostMapping("/projects/{projectId}/progress/{progressId}/publish")
    public ProgressUpdateResponse publish(
            @PathVariable UUID projectId,
            @PathVariable UUID progressId,
            @Valid @RequestBody PublishProgressRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return progressService.publish(projectId, progressId, request, principal);
    }

    @DeleteMapping("/projects/{projectId}/progress/{progressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDraft(
            @PathVariable UUID projectId,
            @PathVariable UUID progressId,
            @AuthenticationPrincipal UserPrincipal principal) {
        progressService.deleteDraftForSiteLead(projectId, progressId, principal);
    }
}
