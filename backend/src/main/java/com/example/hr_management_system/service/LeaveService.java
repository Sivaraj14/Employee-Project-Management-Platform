package com.example.hr_management_system.service;

import com.example.hr_management_system.dto.LeaveUpdateRequest;
import com.example.hr_management_system.models.LeaveRequest;
import com.example.hr_management_system.repository.LeaveRepo;
import com.example.hr_management_system.repository.EmployeeLoginRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRepo leaveRepo;
    private final EmployeeLoginRepo employeeRepo;

    public ResponseEntity<?> handlesubmitLeaveRequest(LeaveRequest request) {
        if (request.getEmployeeId() == null || request.getEmployeeId().isBlank()
                || request.getType() == null || !List.of("Sick", "Casual", "Emergency").contains(request.getType())
                || request.getReason() == null || request.getReason().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Employee ID, leave type, and reason are required."));
        }
        request.setEmployeeId(request.getEmployeeId().trim());
        var employee = employeeRepo.findById(request.getEmployeeId()).orElse(null);
        if (employee == null || !employee.isActive()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No active employee was found for that ID."));
        request.setReason(request.getReason().trim());
        request.setId(null);
        request.setStatus("Pending");
        request.setComment("");
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveRepo.save(request));
    }

    public ResponseEntity<List<LeaveRequest>> getLeaveRequest(String employeeId) {
        return ResponseEntity.ok(leaveRepo.findByEmployeeIdOrderByIdDesc(employeeId));
    }

    public List<LeaveRequest> getAllLeaveRequest() {
        return leaveRepo.findAllByOrderByIdDesc();
    }

    public ResponseEntity<?> updateLeave(Long id, LeaveUpdateRequest request) {
        if (request.getStatus() == null || !List.of("Approved", "Rejected").contains(request.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Choose Approved or Rejected."));
        }
        LeaveRequest leave = leaveRepo.findById(id).orElse(null);
        if (leave == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Leave request not found."));
        leave.setStatus(request.getStatus());
        leave.setComment(request.getComment() == null ? "" : request.getComment().trim());
        return ResponseEntity.ok(leaveRepo.save(leave));
    }
}
