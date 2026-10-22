package com.sitedirect.api.bootstrap;

import com.sitedirect.api.domain.Project;
import com.sitedirect.api.domain.ProjectAssignment;
import com.sitedirect.api.domain.Role;
import com.sitedirect.api.domain.UserAccount;
import com.sitedirect.api.repo.ProjectAssignmentRepository;
import com.sitedirect.api.repo.ProjectRepository;
import com.sitedirect.api.repo.UserAccountRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Idempotent local/demo data: Site Lead user, sample project, SITE_LEAD assignment.
 * Safe to re-run; skips create when email / fixed project id / assignment already exist.
 */
@Component
@Order(100)
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    /** Stable id so restarts do not create duplicate demo projects. */
    static final UUID DEMO_PROJECT_ID = UUID.fromString("a0000000-0000-4000-8000-000000000001");

    static final String DEMO_PROGRESS_TOKEN = "demo-site-progress-token";

    private final UserAccountRepository userAccountRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String siteLeadEmail;
    private final String siteLeadPassword;
    private final String siteLeadName;
    private final String demoProjectName;
    private final String demoProjectLocation;
    private final String demoClientDisplayName;

    public DemoDataSeeder(
            UserAccountRepository userAccountRepository,
            ProjectRepository projectRepository,
            ProjectAssignmentRepository assignmentRepository,
            PasswordEncoder passwordEncoder,
            @Value("${sitedirect.seed.demo-enabled:true}") boolean enabled,
            @Value("${sitedirect.seed.site-lead-email}") String siteLeadEmail,
            @Value("${sitedirect.seed.site-lead-password}") String siteLeadPassword,
            @Value("${sitedirect.seed.site-lead-name}") String siteLeadName,
            @Value("${sitedirect.seed.demo-project-name}") String demoProjectName,
            @Value("${sitedirect.seed.demo-project-location:}") String demoProjectLocation,
            @Value("${sitedirect.seed.demo-client-display-name:}") String demoClientDisplayName) {
        this.userAccountRepository = userAccountRepository;
        this.projectRepository = projectRepository;
        this.assignmentRepository = assignmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.siteLeadEmail = siteLeadEmail;
        this.siteLeadPassword = siteLeadPassword;
        this.siteLeadName = siteLeadName;
        this.demoProjectName = demoProjectName;
        this.demoProjectLocation = demoProjectLocation;
        this.demoClientDisplayName = demoClientDisplayName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        UserAccount lead = ensureSiteLead();
        Project project = ensureDemoProject();
        ensureAssignment(project.getId(), lead.getId());
    }

    private UserAccount ensureSiteLead() {
        return userAccountRepository
                .findByEmailIgnoreCase(siteLeadEmail)
                .orElseGet(() -> {
                    UserAccount created = new UserAccount(
                            UUID.randomUUID(),
                            siteLeadEmail.trim().toLowerCase(),
                            passwordEncoder.encode(siteLeadPassword),
                            siteLeadName,
                            Role.SITE_LEAD);
                    userAccountRepository.save(created);
                    log.info("Seeded demo SITE_LEAD user: {}", siteLeadEmail);
                    return created;
                });
    }

    private Project ensureDemoProject() {
        return projectRepository
                .findById(DEMO_PROJECT_ID)
                .orElseGet(() -> {
                    Project project = new Project(DEMO_PROJECT_ID, demoProjectName.trim(), DEMO_PROGRESS_TOKEN);
                    String location = trimToNull(demoProjectLocation);
                    if (location != null) {
                        project.setLocation(location);
                    }
                    String client = trimToNull(demoClientDisplayName);
                    if (client != null) {
                        project.setClientDisplayName(client);
                    }
                    projectRepository.save(project);
                    log.info("Seeded demo project: {} ({})", demoProjectName, DEMO_PROJECT_ID);
                    return project;
                });
    }

    private void ensureAssignment(UUID projectId, UUID userId) {
        if (assignmentRepository.existsByProjectIdAndUserId(projectId, userId)) {
            return;
        }
        assignmentRepository
                .findByProjectIdAndAssignmentRole(projectId, Role.SITE_LEAD)
                .ifPresent(existing -> {
                    if (!existing.getUserId().equals(userId)) {
                        assignmentRepository.delete(existing);
                    }
                });
        assignmentRepository.save(new ProjectAssignment(UUID.randomUUID(), projectId, userId, Role.SITE_LEAD));
        log.info("Seeded SITE_LEAD assignment for demo project {}", projectId);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
