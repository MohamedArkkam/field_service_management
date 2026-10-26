package com.sitedirect.api.billslabour;

import com.sitedirect.api.billslabour.AttendanceRecord;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByProjectIdOrderByWorkDateDescCreatedAtDesc(UUID projectId);

    Optional<AttendanceRecord> findByWorkerIdAndWorkDate(UUID workerId, LocalDate workDate);

    boolean existsByWorkerIdAndWorkDate(UUID workerId, LocalDate workDate);
}
