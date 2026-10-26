package com.sitedirect.api.progress;

import com.sitedirect.api.progress.ProgressService;
import com.sitedirect.api.progress.ProgressDtos.ClientProgressResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicProgressController {

    private final ProgressService progressService;

    public PublicProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/p/{token}")
    public ClientProgressResponse byToken(@PathVariable String token) {
        return progressService.clientProgress(token);
    }
}
