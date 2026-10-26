package com.sitedirect.api.billslabour;

import com.sitedirect.api.billslabour.PayType;
import com.sitedirect.api.billslabour.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class BillsLabourDtos {

    private BillsLabourDtos() {
    }

    public record CreateWorkerRequest(
            @NotBlank @Size(max = 255) String fullName,
            @NotNull PayType payType,
            @NotNull @DecimalMin("0.0") BigDecimal rate) {
    }

    public record WorkerResponse(
            UUID id, UUID projectId, String fullName, PayType payType, BigDecimal rate, boolean active) {
    }

    public record CreatePurchaseRequest(
            @NotBlank @Size(max = 500) String description,
            @Size(max = 255) String vendorName,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            LocalDate purchasedOn,
            @Size(max = 2000) String note) {
    }

    public record UpdatePaymentRequest(@NotNull @DecimalMin("0.0") BigDecimal amountPaid) {
    }

    public record PurchaseResponse(
            UUID id,
            UUID projectId,
            String description,
            String vendorName,
            BigDecimal amount,
            BigDecimal amountPaid,
            BigDecimal outstanding,
            PaymentStatus paymentStatus,
            LocalDate purchasedOn,
            String note,
            Instant createdAt,
            Instant updatedAt) {
    }

    public record CreateAttendanceRequest(@NotNull UUID workerId, @NotNull LocalDate workDate) {
    }

    public record AttendanceResponse(
            UUID id,
            UUID projectId,
            UUID workerId,
            String workerName,
            LocalDate workDate,
            UUID labourChargeId,
            Instant createdAt) {
    }

    public record LabourChargeResponse(
            UUID id,
            UUID projectId,
            UUID workerId,
            String workerName,
            PayType payType,
            String periodKey,
            String description,
            BigDecimal amount,
            BigDecimal amountPaid,
            BigDecimal outstanding,
            PaymentStatus paymentStatus,
            Instant createdAt,
            Instant updatedAt) {
    }

    public record ProjectLiabilitySummary(
            UUID projectId,
            String projectName,
            BigDecimal purchaseOutstanding,
            BigDecimal labourOutstanding,
            BigDecimal totalOutstanding,
            int openPurchaseCount,
            int openLabourCount) {
    }

    public record LiabilityOverview(
            BigDecimal totalPurchaseOutstanding,
            BigDecimal totalLabourOutstanding,
            BigDecimal totalOutstanding,
            List<ProjectLiabilitySummary> projects) {
    }
}
