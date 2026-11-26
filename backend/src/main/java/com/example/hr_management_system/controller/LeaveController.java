package com.example.hr_management_system.controller;

import com.example.hr_management_system.dto.LeaveUpdateRequest;
import com.example.hr_management_system.models.LeaveRequest;
import com.example.hr_management_system.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
public class LeaveController {
    private final LeaveService leaveService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitLeaveRequest(@RequestBody LeaveRequest request, HttpSession session) {
        if (!String.valueOf(session.getAttribute("userId")).equals(request.getEmployeeId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You can only submit leave for your own account."));
        }
        return leaveService.handlesubmitLeaveRequest(request);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequest(@PathVariable String employeeId) {
        return leaveService.getLeaveRequest(employeeId);
    }

    @GetMapping("/all")
    public List<LeaveRequest> getAllLeaveRequest() {
        return leaveService.getAllLeaveRequest();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeave(@PathVariable Long id, @RequestBody LeaveUpdateRequest request) {
        return leaveService.updateLeave(id, request);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patchLeave(@PathVariable Long id, @RequestBody LeaveUpdateRequest request) {
        return leaveService.updateLeave(id, request);
    }
}
