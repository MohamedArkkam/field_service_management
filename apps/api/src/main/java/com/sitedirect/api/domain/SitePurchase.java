package com.sitedirect.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "site_purchases")
public class SitePurchase {

    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "vendor_name")
    private String vendorName;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "amount_paid", nullable = false, precision = 14, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 32)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "purchased_on", nullable = false)
    private LocalDate purchasedOn = LocalDate.now();

    private String note;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected SitePurchase() {
    }

    public SitePurchase(
            UUID id, UUID projectId, String description, BigDecimal amount, UUID createdBy, LocalDate purchasedOn) {
        this.id = id;
        this.projectId = projectId;
        this.description = description;
        this.amount = amount;
        this.createdBy = createdBy;
        this.purchasedOn = purchasedOn;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public String getDescription() {
        return description;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
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

    public LocalDate getPurchasedOn() {
        return purchasedOn;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
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
