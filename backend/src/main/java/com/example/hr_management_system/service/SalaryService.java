package com.example.hr_management_system.service;

import com.example.hr_management_system.models.Salary_creditions;
import com.example.hr_management_system.repository.SalaryRepo;
import com.example.hr_management_system.repository.EmployeeLoginRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SalaryService {
    private final SalaryRepo salaryRepo;
    private final EmployeeLoginRepo employeeRepo;

    public ResponseEntity<?> creditSalary(Salary_creditions salary) {
        if (salary.getEmployeeId() == null || salary.getEmployeeId().isBlank()
                || salary.getDate() == null || salary.getAmount() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Employee ID, date, and a positive amount are required."));
        }
        salary.setEmployeeId(salary.getEmployeeId().trim());
        var employee = employeeRepo.findById(salary.getEmployeeId()).orElse(null);
        if (employee == null || !employee.isActive()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No active employee was found for that ID."));
        salary.setRemarks(salary.getRemarks() == null ? "" : salary.getRemarks().trim());
        salary.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(salaryRepo.save(salary));
    }

    public List<Salary_creditions> getSalaryDetails(String employeeId) {
        return salaryRepo.findByEmployeeIdOrderByDateDesc(employeeId);
    }
}
