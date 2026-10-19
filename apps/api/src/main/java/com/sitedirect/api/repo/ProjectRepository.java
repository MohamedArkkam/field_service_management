package com.sitedirect.api.repo;

import com.sitedirect.api.domain.Project;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Optional<Project> findByProgressToken(String progressToken);
}
