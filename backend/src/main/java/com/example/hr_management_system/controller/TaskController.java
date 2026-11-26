package com.example.hr_management_system.controller;

import com.example.hr_management_system.dto.EmployeeTaskUpdate;
import com.example.hr_management_system.models.Tasks;
import com.example.hr_management_system.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping({"/assignTask", "/assignedTasks"})
    public ResponseEntity<?> assignTask(@RequestBody Tasks task) {
        return taskService.assignTask(task);
    }

    @PutMapping("/updateTask/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody EmployeeTaskUpdate task) {
        return taskService.updateTask(id, task);
    }

    @PatchMapping("/assignedTasks/{id}")
    public ResponseEntity<?> patchAssignedTask(@PathVariable Long id, @RequestBody EmployeeTaskUpdate task) {
        return taskService.updateTask(id, task);
    }

    @GetMapping({"/all", "/assignedTasks/all"})
    public List<Tasks> getAllTasks() {
        return taskService.getAllTasks();
    }

    @PutMapping("/review/{id}")
    public ResponseEntity<?> reviewTask(@PathVariable Long id, @RequestParam int rating) {
        return taskService.reviewTask(id, rating);
    }

    @GetMapping("/assignedTasks/{employeeId}")
    public ResponseEntity<List<Tasks>> getTasksByEmployeeId(@PathVariable String employeeId) {
        return taskService.getTasksByEmployeeId(employeeId);
    }
}
