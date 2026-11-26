package com.example.hr_management_system.service;

import com.example.hr_management_system.dto.EmployeeTaskUpdate;
import com.example.hr_management_system.models.Tasks;
import com.example.hr_management_system.repository.TaskRepo;
import com.example.hr_management_system.repository.EmployeeLoginRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepo taskRepo;
    private final EmployeeLoginRepo employeeRepo;

    public ResponseEntity<?> assignTask(Tasks task) {
        if (task.getEmployeeId() == null || task.getEmployeeId().isBlank()
                || task.getTitle() == null || task.getTitle().isBlank()
                || task.getDeadline() == null || task.getDeadline().isBlank()
                || task.getPriority() == null || !List.of("Low", "Medium", "High").contains(task.getPriority())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Employee, task title, deadline, and priority are required."));
        }
        String employeeId = task.getEmployeeId().trim();
        var employee = employeeRepo.findById(employeeId).orElse(null);
        if (employee == null || !employee.isActive()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No active employee was found for that ID."));
        task.setId(null);
        task.setEmployeeId(employeeId);
        task.setTitle(task.getTitle().trim());
        task.setProgress(0);
        task.setStatus("Not Started");
        return ResponseEntity.status(HttpStatus.CREATED).body(taskRepo.save(task));
    }

    public ResponseEntity<?> updateTask(Long id, EmployeeTaskUpdate update) {
        if (update.getProgress() < 0 || update.getProgress() > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Progress must be between 0 and 100."));
        }
        if (update.getStatus() == null || !List.of("Not Started", "In Progress", "Completed").contains(update.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Choose a valid task status."));
        }
        Tasks task = taskRepo.findById(id).orElse(null);
        if (task == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Task not found."));
        task.setStatus(update.getStatus());
        task.setProgress(update.getProgress());
        task.setNotes(update.getNotes() == null ? "" : update.getNotes().trim());
        return ResponseEntity.ok(taskRepo.save(task));
    }

    public List<Tasks> getAllTasks() {
        return taskRepo.findAllByOrderByIdDesc();
    }

    public ResponseEntity<?> reviewTask(Long id, int rating) {
        if (rating < 1 || rating > 5) return ResponseEntity.badRequest().body(Map.of("message", "Rating must be between 1 and 5."));
        Tasks task = taskRepo.findById(id).orElse(null);
        if (task == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Task not found."));
        task.setRating(rating);
        return ResponseEntity.ok(taskRepo.save(task));
    }

    public ResponseEntity<List<Tasks>> getTasksByEmployeeId(String employeeId) {
        return ResponseEntity.ok(taskRepo.findByEmployeeIdOrderByIdDesc(employeeId));
    }
}
