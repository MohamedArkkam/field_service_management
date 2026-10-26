package com.sitedirect.api.bootstrap;

import com.sitedirect.api.domain.AttendanceRecord;
import com.sitedirect.api.domain.LabourCharge;
import com.sitedirect.api.domain.Milestone;
import com.sitedirect.api.domain.PayType;
import com.sitedirect.api.domain.Priority;
import com.sitedirect.api.domain.ProgressUpdate;
import com.sitedirect.api.domain.Project;
import com.sitedirect.api.domain.ProjectAssignment;
import com.sitedirect.api.domain.Role;
import com.sitedirect.api.domain.SitePurchase;
import com.sitedirect.api.domain.SiteWorker;
import com.sitedirect.api.domain.UserAccount;
import com.sitedirect.api.repo.AttendanceRecordRepository;
import com.sitedirect.api.repo.LabourChargeRepository;
import com.sitedirect.api.repo.MilestoneRepository;
import com.sitedirect.api.repo.ProgressUpdateRepository;
import com.sitedirect.api.repo.ProjectAssignmentRepository;
import com.sitedirect.api.repo.ProjectRepository;
import com.sitedirect.api.repo.SitePurchaseRepository;
import com.sitedirect.api.repo.SiteWorkerRepository;
import com.sitedirect.api.repo.UserAccountRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
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
 * Idempotent rich demo data for UI review (multi-site portfolio, progress, bills, labour).
 * Stable UUIDs — safe to restart; skips rows that already exist.
 */
@Component
@Order(100)
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    // —— Fixed ids (v4-shaped) ——
    static final UUID PROJECT_A = UUID.fromString("a0000000-0000-4000-8000-000000000001");
    static final UUID PROJECT_B = UUID.fromString("a0000000-0000-4000-8000-000000000002");
    static final UUID PROJECT_C = UUID.fromString("a0000000-0000-4000-8000-000000000003");

    static final UUID LEAD_KUMAR = UUID.fromString("b0000000-0000-4000-8000-000000000001");
    static final UUID LEAD_FATIMA = UUID.fromString("b0000000-0000-4000-8000-000000000002");
    static final UUID CLIENT_JOSEPH = UUID.fromString("b0000000-0000-4000-8000-000000000011");
    static final UUID CLIENT_SCHOOL = UUID.fromString("b0000000-0000-4000-8000-000000000012");

    static final UUID MS_A1 = UUID.fromString("c0000000-0000-4000-8000-000000000001");
    static final UUID MS_A2 = UUID.fromString("c0000000-0000-4000-8000-000000000002");
    static final UUID MS_A3 = UUID.fromString("c0000000-0000-4000-8000-000000000003");
    static final UUID MS_A4 = UUID.fromString("c0000000-0000-4000-8000-000000000004");
    static final UUID MS_A5 = UUID.fromString("c0000000-0000-4000-8000-000000000005");
    static final UUID MS_B1 = UUID.fromString("c0000000-0000-4000-8000-000000000011");
    static final UUID MS_B2 = UUID.fromString("c0000000-0000-4000-8000-000000000012");
    static final UUID MS_B3 = UUID.fromString("c0000000-0000-4000-8000-000000000013");

    static final UUID PROG_A_PUB1 = UUID.fromString("d0000000-0000-4000-8000-000000000001");
    static final UUID PROG_A_PUB2 = UUID.fromString("d0000000-0000-4000-8000-000000000002");
    static final UUID PROG_A_DRAFT = UUID.fromString("d0000000-0000-4000-8000-000000000003");
    static final UUID PROG_B_PUB = UUID.fromString("d0000000-0000-4000-8000-000000000011");
    static final UUID PROG_B_DRAFT = UUID.fromString("d0000000-0000-4000-8000-000000000012");

    static final UUID BUY_UNPAID = UUID.fromString("e0000000-0000-4000-8000-000000000001");
    static final UUID BUY_PARTIAL = UUID.fromString("e0000000-0000-4000-8000-000000000002");
    static final UUID BUY_PAID = UUID.fromString("e0000000-0000-4000-8000-000000000003");
    static final UUID BUY_B = UUID.fromString("e0000000-0000-4000-8000-000000000011");

    static final UUID WORKER_DAILY = UUID.fromString("f0000000-0000-4000-8000-000000000001");
    static final UUID WORKER_MONTHLY = UUID.fromString("f0000000-0000-4000-8000-000000000002");
    static final UUID ATT_1 = UUID.fromString("f0000000-0000-4000-8000-000000000011");
    static final UUID ATT_2 = UUID.fromString("f0000000-0000-4000-8000-000000000012");
    static final UUID LABOUR_1 = UUID.fromString("f0000000-0000-4000-8000-000000000021");
    static final UUID LABOUR_2 = UUID.fromString("f0000000-0000-4000-8000-000000000022");

    private final UserAccountRepository userAccountRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final MilestoneRepository milestoneRepository;
    private final ProgressUpdateRepository progressUpdateRepository;
    private final SitePurchaseRepository purchaseRepository;
    private final SiteWorkerRepository workerRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final LabourChargeRepository labourChargeRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String siteLeadEmail;
    private final String siteLeadPassword;
    private final String siteLeadName;

    public DemoDataSeeder(
            UserAccountRepository userAccountRepository,
            ProjectRepository projectRepository,
            ProjectAssignmentRepository assignmentRepository,
            MilestoneRepository milestoneRepository,
            ProgressUpdateRepository progressUpdateRepository,
            SitePurchaseRepository purchaseRepository,
            SiteWorkerRepository workerRepository,
            AttendanceRecordRepository attendanceRepository,
            LabourChargeRepository labourChargeRepository,
            PasswordEncoder passwordEncoder,
            @Value("${sitedirect.seed.demo-enabled:true}") boolean enabled,
            @Value("${sitedirect.seed.site-lead-email}") String siteLeadEmail,
            @Value("${sitedirect.seed.site-lead-password}") String siteLeadPassword,
            @Value("${sitedirect.seed.site-lead-name}") String siteLeadName) {
        this.userAccountRepository = userAccountRepository;
        this.projectRepository = projectRepository;
        this.assignmentRepository = assignmentRepository;
        this.milestoneRepository = milestoneRepository;
        this.progressUpdateRepository = progressUpdateRepository;
        this.purchaseRepository = purchaseRepository;
        this.workerRepository = workerRepository;
        this.attendanceRepository = attendanceRepository;
        this.labourChargeRepository = labourChargeRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.siteLeadEmail = siteLeadEmail;
        this.siteLeadPassword = siteLeadPassword;
        this.siteLeadName = siteLeadName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        UserAccount kumar = ensureUser(
                LEAD_KUMAR, siteLeadEmail, siteLeadPassword, siteLeadName, Role.SITE_LEAD);
        UserAccount fatima = ensureUser(
                LEAD_FATIMA,
                "fatima@sitedirect.local",
                siteLeadPassword,
                "Fatima (Site Lead)",
                Role.SITE_LEAD);
        UserAccount clientJoseph = ensureUser(
                CLIENT_JOSEPH, "joseph@example.com", "Client123!", "Mr Joseph", Role.CLIENT);
        UserAccount clientSchool = ensureUser(
                CLIENT_SCHOOL, "school@example.com", "Client123!", "St Mary School", Role.CLIENT);

        Project joseph = ensureProject(
                PROJECT_A,
                "Joseph House",
                "demo-site-progress-token",
                "Main Road",
                "Mr Joseph",
                Priority.HIGH,
                new BigDecimal("4800000"),
                "Watch steel delay — high priority client");
        Project school = ensureProject(
                PROJECT_B,
                "School block repair",
                "demo-school-block-token",
                "St Mary campus",
                "St Mary School",
                Priority.MEDIUM,
                new BigDecimal("1200000"),
                "On track for term start");
        Project shop = ensureProject(
                PROJECT_C,
                "Shop renovation",
                "demo-shop-reno-token",
                "Market Street",
                "Mr Ali",
                Priority.LOW,
                new BigDecimal("600000"),
                null);

        ensureAssignment(joseph.getId(), kumar.getId(), Role.SITE_LEAD);
        ensureAssignment(joseph.getId(), clientJoseph.getId(), Role.CLIENT);
        ensureAssignment(school.getId(), fatima.getId(), Role.SITE_LEAD);
        ensureAssignment(school.getId(), clientSchool.getId(), Role.CLIENT);
        ensureAssignment(shop.getId(), kumar.getId(), Role.SITE_LEAD);

        seedJosephRich(joseph, kumar.getId());
        seedSchoolPartial(school, fatima.getId());
        // Shop: intentionally thin — empty milestones / activity for empty states

        log.info("Demo seed ready: 3 projects, 2 Site Leads, 2 Clients, progress/purchases/labour on A+B");
    }

    private void seedJosephRich(Project project, UUID leadId) {
        Milestone m1 = ensureMilestone(MS_A1, project.getId(), "Foundation", "Footings", 0);
        Milestone m2 = ensureMilestone(MS_A2, project.getId(), "Structure", "Columns", 1);
        Milestone m3 = ensureMilestone(MS_A3, project.getId(), "Structure", "Slab", 2);
        ensureMilestone(MS_A4, project.getId(), "Finishing", "Plaster", 3);
        ensureMilestone(MS_A5, project.getId(), "Finishing", "Paint", 4);

        ensurePublished(PROG_A_PUB1, project.getId(), leadId, m1.getId(), "Footings poured", "East wing complete", 4);
        ensurePublished(PROG_A_PUB2, project.getId(), leadId, m2.getId(), "Columns cast", "Grid A–C", 5);
        ensureDraft(PROG_A_DRAFT, project.getId(), leadId, m3.getId(), "Slab prep", "Waiting on steel — not published yet");

        ensurePurchase(BUY_UNPAID, project.getId(), leadId, "Cement (50 bags)", "City Yard", "18500", "0");
        ensurePurchase(BUY_PARTIAL, project.getId(), leadId, "TMT steel 12mm", "Steel Mart", "42000", "15000");
        ensurePurchase(BUY_PAID, project.getId(), leadId, "Binding wire", "City Yard", "2400", "2400");

        SiteWorker daily = ensureWorker(WORKER_DAILY, project.getId(), "Ravi", PayType.DAILY, "900");
        SiteWorker monthly = ensureWorker(WORKER_MONTHLY, project.getId(), "Suresh", PayType.MONTHLY, "18000");
        ensureAttendanceWithLabour(
                ATT_1, LABOUR_1, project.getId(), daily, LocalDate.of(2026, 10, 20), leadId);
        ensureAttendanceWithLabour(
                ATT_2, LABOUR_2, project.getId(), monthly, LocalDate.of(2026, 10, 21), leadId);
    }

    private void seedSchoolPartial(Project project, UUID leadId) {
        Milestone m1 = ensureMilestone(MS_B1, project.getId(), "Repair", "Roof sheets", 0);
        ensureMilestone(MS_B2, project.getId(), "Repair", "Windows", 1);
        ensureMilestone(MS_B3, project.getId(), "Finish", "Paint classrooms", 2);

        ensurePublished(PROG_B_PUB, project.getId(), leadId, m1.getId(), "Roof sheets fixed", "Block B done", 4);
        ensureDraft(PROG_B_DRAFT, project.getId(), leadId, null, "Window frames measured", "Draft for Fatima");

        ensurePurchase(BUY_B, project.getId(), leadId, "Roofing sheets", "BuildSupply", "9500", "0");
    }

    private UserAccount ensureUser(UUID id, String email, String password, String name, Role role) {
        return userAccountRepository
                .findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    UserAccount user = new UserAccount(
                            id,
                            email.trim().toLowerCase(),
                            passwordEncoder.encode(password),
                            name,
                            role);
                    userAccountRepository.save(user);
                    log.info("Seeded demo {}: {}", role, email);
                    return user;
                });
    }

    private Project ensureProject(
            UUID id,
            String name,
            String token,
            String location,
            String clientDisplay,
            Priority priority,
            BigDecimal value,
            String note) {
        return projectRepository
                .findById(id)
                .map(existing -> {
                    // Enrich older thin demo rows without duplicating
                    boolean dirty = false;
                    if (id.equals(PROJECT_A)
                            && ("Demo Site Project".equals(existing.getName())
                                    || "Demo Client".equals(existing.getClientDisplayName()))) {
                        existing.setName(name);
                        existing.setLocation(location);
                        existing.setClientDisplayName(clientDisplay);
                        dirty = true;
                    }
                    if (existing.getPriority() != priority) {
                        existing.setPriority(priority);
                        dirty = true;
                    }
                    if (value != null
                            && (existing.getProjectValue() == null
                                    || existing.getProjectValue().compareTo(value) != 0)
                            && id.equals(PROJECT_A)) {
                        existing.setProjectValue(value);
                        dirty = true;
                    }
                    if (note != null
                            && (existing.getStrategicNote() == null || existing.getStrategicNote().isBlank())) {
                        existing.setStrategicNote(note);
                        dirty = true;
                    }
                    if (existing.getClientDisplayName() == null) {
                        existing.setClientDisplayName(clientDisplay);
                        dirty = true;
                    }
                    return dirty ? projectRepository.save(existing) : existing;
                })
                .orElseGet(() -> {
                    Project project = new Project(id, name, token);
                    project.setLocation(location);
                    project.setClientDisplayName(clientDisplay);
                    project.setPriority(priority);
                    project.setProjectValue(value);
                    project.setStrategicNote(note);
                    projectRepository.save(project);
                    log.info("Seeded demo project: {}", name);
                    return project;
                });
    }

    private void ensureAssignment(UUID projectId, UUID userId, Role role) {
        if (assignmentRepository.existsByProjectIdAndUserId(projectId, userId)) {
            return;
        }
        assignmentRepository
                .findByProjectIdAndAssignmentRole(projectId, role)
                .ifPresent(existing -> {
                    if (!existing.getUserId().equals(userId)) {
                        assignmentRepository.delete(existing);
                    }
                });
        assignmentRepository.save(new ProjectAssignment(UUID.randomUUID(), projectId, userId, role));
    }

    private Milestone ensureMilestone(UUID id, UUID projectId, String phase, String name, int sort) {
        return milestoneRepository
                .findById(id)
                .orElseGet(() -> milestoneRepository.save(new Milestone(id, projectId, phase, name, sort)));
    }

    private void ensurePublished(
            UUID id, UUID projectId, UUID leadId, UUID milestoneId, String title, String note, int rating) {
        if (progressUpdateRepository.existsById(id)) {
            return;
        }
        ProgressUpdate update = new ProgressUpdate(id, projectId, title, leadId);
        update.setNote(note);
        update.setMilestoneId(milestoneId);
        update.setPhotoUrl("https://picsum.photos/seed/" + id.toString().substring(0, 8) + "/640/360");
        update.publish(rating);
        progressUpdateRepository.save(update);
    }

    private void ensureDraft(UUID id, UUID projectId, UUID leadId, UUID milestoneId, String title, String note) {
        if (progressUpdateRepository.existsById(id)) {
            return;
        }
        ProgressUpdate update = new ProgressUpdate(id, projectId, title, leadId);
        update.setNote(note);
        if (milestoneId != null) {
            update.setMilestoneId(milestoneId);
        }
        progressUpdateRepository.save(update);
    }

    private void ensurePurchase(
            UUID id, UUID projectId, UUID leadId, String description, String vendor, String amount, String paid) {
        if (purchaseRepository.existsById(id)) {
            return;
        }
        SitePurchase purchase = new SitePurchase(
                id, projectId, description, new BigDecimal(amount), leadId, LocalDate.of(2026, 10, 18));
        purchase.setVendorName(vendor);
        purchase.applyPayment(new BigDecimal(paid));
        purchaseRepository.save(purchase);
    }

    private SiteWorker ensureWorker(UUID id, UUID projectId, String name, PayType payType, String rate) {
        return workerRepository
                .findById(id)
                .orElseGet(() -> workerRepository.save(
                        new SiteWorker(id, projectId, name, payType, new BigDecimal(rate))));
    }

    private void ensureAttendanceWithLabour(
            UUID attendanceId,
            UUID labourId,
            UUID projectId,
            SiteWorker worker,
            LocalDate workDate,
            UUID leadId) {
        if (attendanceRepository.existsById(attendanceId)) {
            return;
        }
        AttendanceRecord attendance =
                new AttendanceRecord(attendanceId, projectId, worker.getId(), workDate, leadId);
        attendanceRepository.save(attendance);

        if (labourChargeRepository.existsById(labourId)) {
            return;
        }
        String periodKey;
        String description;
        if (worker.getPayType() == PayType.DAILY) {
            periodKey = workDate.toString();
            description = "Daily wage — " + worker.getFullName() + " — " + periodKey;
        } else {
            periodKey = workDate.toString().substring(0, 7);
            description = "Monthly salary — " + worker.getFullName() + " — " + periodKey;
        }
        labourChargeRepository.save(new LabourCharge(
                labourId,
                projectId,
                worker.getId(),
                attendanceId,
                worker.getPayType(),
                periodKey,
                description,
                worker.getRate(),
                leadId));
    }
}
