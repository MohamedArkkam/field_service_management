package com.sitedirect.api.auth;

import com.sitedirect.api.security.UserPrincipal;
import com.sitedirect.api.auth.AuthService;
import com.sitedirect.api.auth.AuthDtos.LoginRequest;
import com.sitedirect.api.auth.AuthDtos.LoginResponse;
import com.sitedirect.api.auth.AuthDtos.UserResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.toResponse(principal);
    }
}
