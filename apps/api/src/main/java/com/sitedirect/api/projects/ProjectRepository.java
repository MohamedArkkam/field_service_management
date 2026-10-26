package com.sitedirect.api.projects;

import com.sitedirect.api.projects.Project;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Optional<Project> findByProgressToken(String progressToken);
}
