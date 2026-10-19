package com.sitedirect.api.web;

import com.sitedirect.api.domain.Role;
import com.sitedirect.api.service.AuthService;
import com.sitedirect.api.web.dto.AuthDtos.CreateUserRequest;
import com.sitedirect.api.web.dto.AuthDtos.UserResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return authService.createUser(request);
    }

    @GetMapping
    public List<UserResponse> list(@RequestParam Role role) {
        if (role != Role.SITE_LEAD && role != Role.CLIENT) {
            throw new IllegalArgumentException("role filter must be SITE_LEAD or CLIENT");
        }
        return authService.listUsersByRole(role);
    }
}
