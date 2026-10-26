package com.sitedirect.api.billslabour;

import com.sitedirect.api.billslabour.AttendanceRecord;
import com.sitedirect.api.billslabour.LabourCharge;
import com.sitedirect.api.billslabour.PayType;
import com.sitedirect.api.billslabour.PaymentStatus;
import com.sitedirect.api.projects.Project;
import com.sitedirect.api.projects.ProjectRepository;
import com.sitedirect.api.projects.SiteAccessService;
import com.sitedirect.api.billslabour.AttendanceRecordRepository;
import com.sitedirect.api.billslabour.LabourChargeRepository;
import com.sitedirect.api.billslabour.SitePurchaseRepository;
import com.sitedirect.api.billslabour.SiteWorkerRepository;
import com.sitedirect.api.security.UserPrincipal;
import com.sitedirect.api.billslabour.BillsLabourDtos.AttendanceResponse;
import com.sitedirect.api.billslabour.BillsLabourDtos.CreateAttendanceRequest;
import com.sitedirect.api.billslabour.BillsLabourDtos.CreatePurchaseRequest;
import com.sitedirect.api.billslabour.BillsLabourDtos.CreateWorkerRequest;
import com.sitedirect.api.billslabour.BillsLabourDtos.LabourChargeResponse;
import com.sitedirect.api.billslabour.BillsLabourDtos.LiabilityOverview;
import com.sitedirect.api.billslabour.BillsLabourDtos.ProjectLiabilitySummary;
import com.sitedirect.api.billslabour.BillsLabourDtos.PurchaseResponse;
import com.sitedirect.api.billslabour.BillsLabourDtos.UpdatePaymentRequest;
import com.sitedirect.api.billslabour.BillsLabourDtos.WorkerResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillsLabourService {

    private static final List<PaymentStatus> OPEN_STATUSES = List.of(PaymentStatus.UNPAID, PaymentStatus.PARTIAL);

    private final SiteAccessService siteAccessService;
    private final ProjectRepository projectRepository;
    private final SiteWorkerRepository workerRepository;
    private final SitePurchaseRepository purchaseRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final LabourChargeRepository labourChargeRepository;

    public BillsLabourService(
            SiteAccessService siteAccessService,
            ProjectRepository projectRepository,
            SiteWorkerRepository workerRepository,
            SitePurchaseRepository purchaseRepository,
            AttendanceRecordRepository attendanceRepository,
            LabourChargeRepository labourChargeRepository) {
        this.siteAccessService = siteAccessService;
        this.projectRepository = projectRepository;
        this.workerRepository = workerRepository;
        this.purchaseRepository = purchaseRepository;
        this.attendanceRepository = attendanceRepository;
        this.labourChargeRepository = labourChargeRepository;
    }

    @Transactional
    public WorkerResponse createWorker(UUID projectId, CreateWorkerRequest request, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        if (request.rate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("rate must be >= 0");
        }
        SiteWorker worker = new SiteWorker(
                UUID.randomUUID(),
                projectId,
                request.fullName().trim(),
                request.payType(),
                request.rate());
        workerRepository.save(worker);
        siteAccessService.requireProject(projectId).touch();
        return toWorker(worker);
    }

    @Transactional(readOnly = true)
    public List<WorkerResponse> listWorkersForSite(UUID projectId, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        return workerRepository.findByProjectIdOrderByFullNameAsc(projectId).stream()
                .map(this::toWorker)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkerResponse> listWorkersForAdmin(UUID projectId) {
        siteAccessService.requireProject(projectId);
        return workerRepository.findByProjectIdOrderByFullNameAsc(projectId).stream()
                .map(this::toWorker)
                .toList();
    }

    @Transactional
    public PurchaseResponse createPurchase(UUID projectId, CreatePurchaseRequest request, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        LocalDate purchasedOn = request.purchasedOn() == null ? LocalDate.now() : request.purchasedOn();
        SitePurchase purchase = new SitePurchase(
                UUID.randomUUID(),
                projectId,
                request.description().trim(),
                request.amount(),
                principal.getId(),
                purchasedOn);
        purchase.setVendorName(trimToNull(request.vendorName()));
        purchase.setNote(trimToNull(request.note()));
        purchaseRepository.save(purchase);
        siteAccessService.requireProject(projectId).touch();
        return toPurchase(purchase);
    }

    @Transactional
    public PurchaseResponse updatePurchasePayment(
            UUID projectId, UUID purchaseId, UpdatePaymentRequest request, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        SitePurchase purchase = requirePurchase(projectId, purchaseId);
        purchase.applyPayment(request.amountPaid());
        siteAccessService.requireProject(projectId).touch();
        return toPurchase(purchase);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> listPurchasesForSite(UUID projectId, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        return purchaseRepository.findByProjectIdOrderByPurchasedOnDescCreatedAtDesc(projectId).stream()
                .map(this::toPurchase)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> listPurchasesForAdmin(UUID projectId) {
        siteAccessService.requireProject(projectId);
        return purchaseRepository.findByProjectIdOrderByPurchasedOnDescCreatedAtDesc(projectId).stream()
                .map(this::toPurchase)
                .toList();
    }

    @Transactional
    public AttendanceResponse markAttendance(
            UUID projectId, CreateAttendanceRequest request, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        SiteWorker worker = workerRepository
                .findById(request.workerId())
                .orElseThrow(() -> new IllegalArgumentException("Worker not found"));
        if (!worker.getProjectId().equals(projectId)) {
            throw new IllegalArgumentException("Worker does not belong to project");
        }
        if (!worker.isActive()) {
            throw new IllegalArgumentException("Worker is inactive");
        }
        if (attendanceRepository.existsByWorkerIdAndWorkDate(worker.getId(), request.workDate())) {
            throw new IllegalArgumentException("Attendance already recorded for this worker and date");
        }
        if (worker.getRate().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Worker rate must be > 0 to create wage liability");
        }

        AttendanceRecord attendance = new AttendanceRecord(
                UUID.randomUUID(), projectId, worker.getId(), request.workDate(), principal.getId());
        attendanceRepository.save(attendance);

        LabourCharge charge = ensureLabourCharge(worker, attendance, principal.getId());
        siteAccessService.requireProject(projectId).touch();
        return toAttendance(attendance, worker.getFullName(), charge.getId());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> listAttendanceForSite(UUID projectId, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        return mapAttendance(projectId);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> listAttendanceForAdmin(UUID projectId) {
        siteAccessService.requireProject(projectId);
        return mapAttendance(projectId);
    }

    @Transactional
    public LabourChargeResponse updateLabourPayment(
            UUID projectId, UUID chargeId, UpdatePaymentRequest request, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        LabourCharge charge = requireLabourCharge(projectId, chargeId);
        charge.applyPayment(request.amountPaid());
        siteAccessService.requireProject(projectId).touch();
        return toLabour(charge, workerName(charge.getWorkerId()));
    }

    @Transactional(readOnly = true)
    public List<LabourChargeResponse> listLabourForSite(UUID projectId, UserPrincipal principal) {
        siteAccessService.requireAssignedSiteLead(projectId, principal);
        return mapLabour(projectId);
    }

    @Transactional(readOnly = true)
    public List<LabourChargeResponse> listLabourForAdmin(UUID projectId) {
        siteAccessService.requireProject(projectId);
        return mapLabour(projectId);
    }

    @Transactional(readOnly = true)
    public LiabilityOverview outstandingLiabilities() {
        Map<UUID, ProjectLiabilitySummaryBuilder> byProject = new HashMap<>();

        for (SitePurchase purchase : purchaseRepository.findByPaymentStatusInOrderByPurchasedOnDescCreatedAtDesc(
                OPEN_STATUSES)) {
            ProjectLiabilitySummaryBuilder builder = byProject.computeIfAbsent(
                    purchase.getProjectId(), id -> newProjectBuilder(id));
            builder.purchaseOutstanding = builder.purchaseOutstanding.add(purchase.getOutstanding());
            builder.openPurchaseCount++;
        }

        for (LabourCharge charge :
                labourChargeRepository.findByPaymentStatusInOrderByCreatedAtDesc(OPEN_STATUSES)) {
            ProjectLiabilitySummaryBuilder builder =
                    byProject.computeIfAbsent(charge.getProjectId(), id -> newProjectBuilder(id));
            builder.labourOutstanding = builder.labourOutstanding.add(charge.getOutstanding());
            builder.openLabourCount++;
        }

        List<ProjectLiabilitySummary> projects = byProject.values().stream()
                .map(ProjectLiabilitySummaryBuilder::toSummary)
                .sorted(Comparator.comparing(ProjectLiabilitySummary::totalOutstanding).reversed())
                .toList();

        BigDecimal purchaseTotal = projects.stream()
                .map(ProjectLiabilitySummary::purchaseOutstanding)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal labourTotal = projects.stream()
                .map(ProjectLiabilitySummary::labourOutstanding)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new LiabilityOverview(
                purchaseTotal, labourTotal, purchaseTotal.add(labourTotal), projects);
    }

    private LabourCharge ensureLabourCharge(SiteWorker worker, AttendanceRecord attendance, UUID createdBy) {
        String periodKey;
        String description;
        if (worker.getPayType() == PayType.DAILY) {
            periodKey = attendance.getWorkDate().toString();
            description = "Daily wage — " + worker.getFullName() + " — " + periodKey;
        } else {
            periodKey = attendance.getWorkDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            description = "Monthly salary — " + worker.getFullName() + " — " + periodKey;
            return labourChargeRepository
                    .findByWorkerIdAndPeriodKey(worker.getId(), periodKey)
                    .orElseGet(() -> labourChargeRepository.save(new LabourCharge(
                            UUID.randomUUID(),
                            worker.getProjectId(),
                            worker.getId(),
                            attendance.getId(),
                            PayType.MONTHLY,
                            periodKey,
                            description,
                            worker.getRate(),
                            createdBy)));
        }
        return labourChargeRepository
                .findByWorkerIdAndPeriodKey(worker.getId(), periodKey)
                .orElseGet(() -> labourChargeRepository.save(new LabourCharge(
                        UUID.randomUUID(),
                        worker.getProjectId(),
                        worker.getId(),
                        attendance.getId(),
                        PayType.DAILY,
                        periodKey,
                        description,
                        worker.getRate(),
                        createdBy)));
    }

    private List<AttendanceResponse> mapAttendance(UUID projectId) {
        Map<UUID, SiteWorker> workers = new HashMap<>();
        for (SiteWorker worker : workerRepository.findByProjectIdOrderByFullNameAsc(projectId)) {
            workers.put(worker.getId(), worker);
        }
        List<AttendanceResponse> result = new ArrayList<>();
        for (AttendanceRecord record :
                attendanceRepository.findByProjectIdOrderByWorkDateDescCreatedAtDesc(projectId)) {
            SiteWorker worker = workers.get(record.getWorkerId());
            String workerName = worker == null ? "Unknown" : worker.getFullName();
            PayType payType = worker == null ? PayType.DAILY : worker.getPayType();
            String periodKey = periodKeyFor(record.getWorkDate(), payType);
            UUID chargeId = labourChargeRepository
                    .findByWorkerIdAndPeriodKey(record.getWorkerId(), periodKey)
                    .map(LabourCharge::getId)
                    .orElse(null);
            result.add(toAttendance(record, workerName, chargeId));
        }
        return result;
    }

    private String periodKeyFor(LocalDate workDate, PayType payType) {
        if (payType == PayType.MONTHLY) {
            return workDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return workDate.toString();
    }

    private List<LabourChargeResponse> mapLabour(UUID projectId) {
        Map<UUID, String> names = workerNames(projectId);
        return labourChargeRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(c -> toLabour(c, names.getOrDefault(c.getWorkerId(), "Unknown")))
                .toList();
    }

    private Map<UUID, String> workerNames(UUID projectId) {
        Map<UUID, String> names = new HashMap<>();
        for (SiteWorker worker : workerRepository.findByProjectIdOrderByFullNameAsc(projectId)) {
            names.put(worker.getId(), worker.getFullName());
        }
        return names;
    }

    private String workerName(UUID workerId) {
        return workerRepository.findById(workerId).map(SiteWorker::getFullName).orElse("Unknown");
    }

    private SitePurchase requirePurchase(UUID projectId, UUID purchaseId) {
        SitePurchase purchase = purchaseRepository
                .findById(purchaseId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase not found"));
        if (!purchase.getProjectId().equals(projectId)) {
            throw new IllegalArgumentException("Purchase does not belong to project");
        }
        return purchase;
    }

    private LabourCharge requireLabourCharge(UUID projectId, UUID chargeId) {
        LabourCharge charge = labourChargeRepository
                .findById(chargeId)
                .orElseThrow(() -> new IllegalArgumentException("Labour charge not found"));
        if (!charge.getProjectId().equals(projectId)) {
            throw new IllegalArgumentException("Labour charge does not belong to project");
        }
        return charge;
    }

    private ProjectLiabilitySummaryBuilder newProjectBuilder(UUID projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        ProjectLiabilitySummaryBuilder builder = new ProjectLiabilitySummaryBuilder();
        builder.projectId = projectId;
        builder.projectName = project == null ? "Unknown project" : project.getName();
        return builder;
    }

    private WorkerResponse toWorker(SiteWorker worker) {
        return new WorkerResponse(
                worker.getId(),
                worker.getProjectId(),
                worker.getFullName(),
                worker.getPayType(),
                worker.getRate(),
                worker.isActive());
    }

    private PurchaseResponse toPurchase(SitePurchase purchase) {
        return new PurchaseResponse(
                purchase.getId(),
                purchase.getProjectId(),
                purchase.getDescription(),
                purchase.getVendorName(),
                purchase.getAmount(),
                purchase.getAmountPaid(),
                purchase.getOutstanding(),
                purchase.getPaymentStatus(),
                purchase.getPurchasedOn(),
                purchase.getNote(),
                purchase.getCreatedAt(),
                purchase.getUpdatedAt());
    }

    private AttendanceResponse toAttendance(AttendanceRecord record, String workerName, UUID labourChargeId) {
        return new AttendanceResponse(
                record.getId(),
                record.getProjectId(),
                record.getWorkerId(),
                workerName,
                record.getWorkDate(),
                labourChargeId,
                record.getCreatedAt());
    }

    private LabourChargeResponse toLabour(LabourCharge charge, String workerName) {
        return new LabourChargeResponse(
                charge.getId(),
                charge.getProjectId(),
                charge.getWorkerId(),
                workerName,
                charge.getPayType(),
                charge.getPeriodKey(),
                charge.getDescription(),
                charge.getAmount(),
                charge.getAmountPaid(),
                charge.getOutstanding(),
                charge.getPaymentStatus(),
                charge.getCreatedAt(),
                charge.getUpdatedAt());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static final class ProjectLiabilitySummaryBuilder {
        private UUID projectId;
        private String projectName;
        private BigDecimal purchaseOutstanding = BigDecimal.ZERO;
        private BigDecimal labourOutstanding = BigDecimal.ZERO;
        private int openPurchaseCount;
        private int openLabourCount;

        private ProjectLiabilitySummary toSummary() {
            return new ProjectLiabilitySummary(
                    projectId,
                    projectName,
                    purchaseOutstanding,
                    labourOutstanding,
                    purchaseOutstanding.add(labourOutstanding),
                    openPurchaseCount,
                    openLabourCount);
        }
    }
}
