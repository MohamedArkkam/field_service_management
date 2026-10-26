package com.sitedirect.api.billslabour;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "labour_charges")
public class LabourCharge {

    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "worker_id", nullable = false)
    private UUID workerId;

    @Column(name = "attendance_id")
    private UUID attendanceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_type", nullable = false, length = 32)
    private PayType payType;

    @Column(name = "period_key", nullable = false, length = 16)
    private String periodKey;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "amount_paid", nullable = false, precision = 14, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 32)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected LabourCharge() {
    }

    public LabourCharge(
            UUID id,
            UUID projectId,
            UUID workerId,
            UUID attendanceId,
            PayType payType,
            String periodKey,
            String description,
            BigDecimal amount,
            UUID createdBy) {
        this.id = id;
        this.projectId = projectId;
        this.workerId = workerId;
        this.attendanceId = attendanceId;
        this.payType = payType;
        this.periodKey = periodKey;
        this.description = description;
        this.amount = amount;
        this.createdBy = createdBy;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public UUID getWorkerId() {
        return workerId;
    }

    public UUID getAttendanceId() {
        return attendanceId;
    }

    public PayType getPayType() {
        return payType;
    }

    public String getPeriodKey() {
        return periodKey;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public BigDecimal getOutstanding() {
        return amount.subtract(amountPaid);
    }

    public void applyPayment(BigDecimal newAmountPaid) {
        if (newAmountPaid == null) {
            throw new IllegalArgumentException("amountPaid is required");
        }
        if (newAmountPaid.compareTo(BigDecimal.ZERO) < 0 || newAmountPaid.compareTo(amount) > 0) {
            throw new IllegalArgumentException("amountPaid must be between 0 and amount");
        }
        this.amountPaid = newAmountPaid;
        this.paymentStatus = PaymentStatus.fromAmounts(amount, newAmountPaid);
        this.updatedAt = Instant.now();
    }
}
