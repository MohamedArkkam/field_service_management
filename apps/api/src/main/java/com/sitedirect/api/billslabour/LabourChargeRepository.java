package com.sitedirect.api.billslabour;

import com.sitedirect.api.billslabour.LabourCharge;
import com.sitedirect.api.billslabour.PaymentStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabourChargeRepository extends JpaRepository<LabourCharge, UUID> {
    List<LabourCharge> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    Optional<LabourCharge> findByWorkerIdAndPeriodKey(UUID workerId, String periodKey);

    List<LabourCharge> findByPaymentStatusInOrderByCreatedAtDesc(List<PaymentStatus> statuses);
}
