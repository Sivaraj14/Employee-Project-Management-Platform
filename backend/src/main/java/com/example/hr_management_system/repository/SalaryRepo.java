package com.example.hr_management_system.repository;

import com.example.hr_management_system.models.Salary_creditions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryRepo extends JpaRepository<Salary_creditions, Long> {

    List<Salary_creditions> findByEmployeeId(String employeeId);

    List<Salary_creditions> findByEmployeeIdOrderByDateDesc(String employeeId);
}
