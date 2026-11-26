package com.example.hr_management_system.repository;

import com.example.hr_management_system.models.Tasks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends JpaRepository<Tasks, Long> {

    List<Tasks> findByEmployeeIdOrderByIdDesc(String employeeId);

    List<Tasks> findAllByOrderByIdDesc();

    @Query("SELECT t FROM Tasks t WHERE t.employeeId = :empId")
    List<Tasks> findByempId(@Param("empId") String empId);
}
