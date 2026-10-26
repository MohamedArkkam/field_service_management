package com.sitedirect.api.bootstrap;

import com.sitedirect.api.common.Role;
import com.sitedirect.api.auth.UserAccount;
import com.sitedirect.api.auth.UserAccountRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserSeeder.class);

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public AdminUserSeeder(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            @Value("${sitedirect.seed.admin-email}") String adminEmail,
            @Value("${sitedirect.seed.admin-password}") String adminPassword,
            @Value("${sitedirect.seed.admin-name}") String adminName) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminName = adminName;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userAccountRepository.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }
        UserAccount admin = new UserAccount(
                UUID.randomUUID(),
                adminEmail.trim().toLowerCase(),
                passwordEncoder.encode(adminPassword),
                adminName,
                Role.ADMIN);
        userAccountRepository.save(admin);
        log.info("Seeded default ADMIN user: {}", adminEmail);
    }
}
