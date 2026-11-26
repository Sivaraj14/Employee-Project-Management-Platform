package com.example.hr_management_system.repository;

import com.example.hr_management_system.models.Employee_details;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeLoginRepo extends JpaRepository<Employee_details, String> {

    Employee_details findByActivationId(String ActivationId);
}
