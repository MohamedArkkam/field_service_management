package com.sitedirect.api.web;

import com.sitedirect.api.service.ProgressService;
import com.sitedirect.api.web.dto.ProgressDtos.ProgressUpdateResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
}