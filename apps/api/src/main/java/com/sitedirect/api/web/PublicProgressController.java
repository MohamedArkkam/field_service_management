package com.sitedirect.api.web;

import com.sitedirect.api.service.ProgressService;
import com.sitedirect.api.web.dto.ProgressDtos.ClientProgressResponse;
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
