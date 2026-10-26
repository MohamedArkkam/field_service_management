package com.sitedirect.api.billslabour;

import com.sitedirect.api.billslabour.PaymentStatus;
import com.sitedirect.api.billslabour.SitePurchase;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SitePurchaseRepository extends JpaRepository<SitePurchase, UUID> {
    List<SitePurchase> findByProjectIdOrderByPurchasedOnDescCreatedAtDesc(UUID projectId);

    List<SitePurchase> findByPaymentStatusInOrderByPurchasedOnDescCreatedAtDesc(List<PaymentStatus> statuses);
}
