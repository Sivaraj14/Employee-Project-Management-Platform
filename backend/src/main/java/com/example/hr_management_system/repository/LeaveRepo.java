package com.example.hr_management_system.repository;

import com.example.hr_management_system.models.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepo extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeId(String employeeId);

    List<LeaveRequest> findByEmployeeIdOrderByIdDesc(String employeeId);

    List<LeaveRequest> findAllByOrderByIdDesc();

    List<LeaveRequest> findAllByEmployeeIdOrderByIdDesc(String employeeId);

    List<LeaveRequest> findAllByStatusOrderByIdDesc(String status);
}

