package com.example.hr_management_system.repository;

import com.example.hr_management_system.models.Manager_details;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ManagerLoginRepo extends JpaRepository<Manager_details, String> {

    Manager_details findByActivationId(String ActivationId);
}
