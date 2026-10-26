package com.sitedirect.api.billslabour;

import com.sitedirect.api.security.UserPrincipal;
import com.sitedirect.api.billslabour.BillsLabourService;
import com.sitedirect.api.billslabour.BillsLabourDtos.AttendanceResponse;
import com.sitedirect.api.billslabour.BillsLabourDtos.CreateAttendanceRequest;
import com.sitedirect.api.billslabour.BillsLabourDtos.CreatePurchaseRequest;
import com.sitedirect.api.billslabour.BillsLabourDtos.CreateWorkerRequest;
import com.sitedirect.api.billslabour.BillsLabourDtos.LabourChargeResponse;
import com.sitedirect.api.billslabour.BillsLabourDtos.PurchaseResponse;
import com.sitedirect.api.billslabour.BillsLabourDtos.UpdatePaymentRequest;
import com.sitedirect.api.billslabour.BillsLabourDtos.WorkerResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site/projects/{projectId}")
@PreAuthorize("hasRole('SITE_LEAD')")
public class SiteBillsLabourController {

    private final BillsLabourService billsLabourService;

    public SiteBillsLabourController(BillsLabourService billsLabourService) {
        this.billsLabourService = billsLabourService;
    }

    @GetMapping("/workers")
    public List<WorkerResponse> workers(
            @PathVariable UUID projectId, @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.listWorkersForSite(projectId, principal);
    }

    @PostMapping("/workers")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkerResponse createWorker(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateWorkerRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.createWorker(projectId, request, principal);
    }

    @GetMapping("/purchases")
    public List<PurchaseResponse> purchases(
            @PathVariable UUID projectId, @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.listPurchasesForSite(projectId, principal);
    }

    @PostMapping("/purchases")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseResponse createPurchase(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreatePurchaseRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.createPurchase(projectId, request, principal);
    }

    @PutMapping("/purchases/{purchaseId}/payment")
    public PurchaseResponse updatePurchasePayment(
            @PathVariable UUID projectId,
            @PathVariable UUID purchaseId,
            @Valid @RequestBody UpdatePaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.updatePurchasePayment(projectId, purchaseId, request, principal);
    }

    @GetMapping("/attendance")
    public List<AttendanceResponse> attendance(
            @PathVariable UUID projectId, @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.listAttendanceForSite(projectId, principal);
    }

    @PostMapping("/attendance")
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceResponse markAttendance(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateAttendanceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.markAttendance(projectId, request, principal);
    }

    @GetMapping("/labour")
    public List<LabourChargeResponse> labour(
            @PathVariable UUID projectId, @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.listLabourForSite(projectId, principal);
    }

    @PutMapping("/labour/{chargeId}/payment")
    public LabourChargeResponse updateLabourPayment(
            @PathVariable UUID projectId,
            @PathVariable UUID chargeId,
            @Valid @RequestBody UpdatePaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return billsLabourService.updateLabourPayment(projectId, chargeId, request, principal);
    }
}
