package com.example.hr_management_system.controller;

import com.example.hr_management_system.models.Salary_creditions;
import com.example.hr_management_system.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/salaryCreditions")
@RequiredArgsConstructor
public class SalaryController {
    private final SalaryService salaryService;

    @PostMapping({"/credit", "", "/"})
    public ResponseEntity<?> creditSalary(@RequestBody Salary_creditions salary) {
        return salaryService.creditSalary(salary);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Salary_creditions> getSalaryDetails(@PathVariable String employeeId) {
        return salaryService.getSalaryDetails(employeeId);
    }
}
