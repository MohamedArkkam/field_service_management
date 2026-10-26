package com.sitedirect.api.auth;

import com.sitedirect.api.common.Role;
import com.sitedirect.api.auth.UserAccount;
import com.sitedirect.api.auth.UserAccountRepository;
import com.sitedirect.api.security.JwtService;
import com.sitedirect.api.security.UserPrincipal;
import com.sitedirect.api.auth.AuthDtos.CreateUserRequest;
import com.sitedirect.api.auth.AuthDtos.LoginRequest;
import com.sitedirect.api.auth.AuthDtos.LoginResponse;
import com.sitedirect.api.auth.AuthDtos.UserResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.createToken(principal);
        return new LoginResponse(token, toResponse(principal));
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (request.role() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot create additional ADMIN users via API in M1");
        }
        if (request.role() != Role.SITE_LEAD && request.role() != Role.CLIENT) {
            throw new IllegalArgumentException("Role must be SITE_LEAD or CLIENT");
        }
        String email = request.email().trim().toLowerCase();
        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        UserAccount user = new UserAccount(
                UUID.randomUUID(),
                email,
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.role());
        userAccountRepository.save(user);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsersByRole(Role role) {
        return userAccountRepository.findByRoleOrderByFullNameAsc(role).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse deactivateUser(UUID userId) {
        UserAccount user = userAccountRepository
                .findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot deactivate ADMIN users");
        }
        if (!user.isActive()) {
            return toResponse(user);
        }
        user.setActive(false);
        return toResponse(user);
    }

    @Transactional
    public UserResponse reactivateUser(UUID userId) {
        UserAccount user = userAccountRepository
                .findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot change ADMIN active state via this API");
        }
        if (user.isActive()) {
            return toResponse(user);
        }
        user.setActive(true);
        return toResponse(user);
    }

    public UserResponse toResponse(UserAccount user) {
        return new UserResponse(
                user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.isActive());
    }

    public UserResponse toResponse(UserPrincipal principal) {
        return new UserResponse(
                principal.getId(),
                principal.getUsername(),
                principal.getFullName(),
                principal.getRole(),
                principal.isEnabled());
    }
}
