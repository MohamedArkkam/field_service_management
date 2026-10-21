package com.sitedirect.api.web;

import com.sitedirect.api.service.BillsLabourService;
import com.sitedirect.api.web.dto.BillsLabourDtos.AttendanceResponse;
import com.sitedirect.api.web.dto.BillsLabourDtos.LabourChargeResponse;
import com.sitedirect.api.web.dto.BillsLabourDtos.LiabilityOverview;
import com.sitedirect.api.web.dto.BillsLabourDtos.PurchaseResponse;
import com.sitedirect.api.web.dto.BillsLabourDtos.WorkerResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBillsLabourController {

    private final BillsLabourService billsLabourService;

    public AdminBillsLabourController(BillsLabourService billsLabourService) {
        this.billsLabourService = billsLabourService;
    }

    @GetMapping("/liabilities")
    public LiabilityOverview liabilities() {
        return billsLabourService.outstandingLiabilities();
    }

    @GetMapping("/projects/{projectId}/workers")
    public List<WorkerResponse> workers(@PathVariable UUID projectId) {
        return billsLabourService.listWorkersForAdmin(projectId);
    }

    @GetMapping("/projects/{projectId}/purchases")
    public List<PurchaseResponse> purchases(@PathVariable UUID projectId) {
        return billsLabourService.listPurchasesForAdmin(projectId);
    }

    @GetMapping("/projects/{projectId}/attendance")
    public List<AttendanceResponse> attendance(@PathVariable UUID projectId) {
        return billsLabourService.listAttendanceForAdmin(projectId);
    }

    @GetMapping("/projects/{projectId}/labour")
    public List<LabourChargeResponse> labour(@PathVariable UUID projectId) {
        return billsLabourService.listLabourForAdmin(projectId);
    }
}
