package com.sitedirect.api.billslabour;

import com.sitedirect.api.billslabour.SiteWorker;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteWorkerRepository extends JpaRepository<SiteWorker, UUID> {
    List<SiteWorker> findByProjectIdOrderByFullNameAsc(UUID projectId);
}
