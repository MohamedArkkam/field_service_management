package com.sitedirect.api.auth;

import com.sitedirect.api.common.Role;
import com.sitedirect.api.auth.UserAccount;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<UserAccount> findByRoleOrderByFullNameAsc(Role role);
}
