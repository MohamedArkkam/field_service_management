package com.sitedirect.api.progress;

import com.sitedirect.api.progress.ProgressService;
import com.sitedirect.api.progress.ProgressDtos.ProgressUpdateResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/progress")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProgressController {

    private final ProgressService progressService;

    public AdminProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public List<ProgressUpdateResponse> list(@PathVariable UUID projectId) {
        return progressService.listForAdmin(projectId);
    }

    @DeleteMapping("/{progressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDraft(@PathVariable UUID projectId, @PathVariable UUID progressId) {
        progressService.deleteDraftForAdmin(projectId, progressId);
    }
}