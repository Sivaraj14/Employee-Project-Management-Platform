package com.example.hr_management_system.service;

import com.example.hr_management_system.dto.NotificationItem;
import com.example.hr_management_system.models.LeaveRequest;
import com.example.hr_management_system.models.Tasks;
import com.example.hr_management_system.repository.LeaveRepo;
import com.example.hr_management_system.repository.TaskRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final TaskRepo taskRepo;
    private final LeaveRepo leaveRepo;

    public List<NotificationItem> forUser(String role, String userId) {
        List<NotificationItem> notifications = new ArrayList<>();
        if ("manager".equals(role)) addManagerNotifications(notifications);
        if ("employee".equals(role)) addEmployeeNotifications(notifications, userId);
        return notifications.stream()
                .sorted(Comparator.comparing(NotificationItem::createdAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(30)
                .toList();
    }

    private void addManagerNotifications(List<NotificationItem> notifications) {
        for (LeaveRequest leave : leaveRepo.findAllByStatusOrderByIdDesc("Pending")) {
            notifications.add(new NotificationItem(
                    "leave-pending-" + leave.getId(), "leave", "Leave request needs review",
                    leave.getEmployeeId() + " requested " + leave.getType().toLowerCase() + " leave.",
                    leave.getCreatedAt(), "approveLeave"));
        }
        for (Tasks task : taskRepo.findAllByOrderByIdDesc()) {
            if (task.getUpdatedAt() != null && task.getCreatedAt() != null
                    && task.getUpdatedAt().isAfter(task.getCreatedAt())) {
                notifications.add(new NotificationItem(
                        "task-update-" + task.getId() + "-" + task.getUpdatedAt().toString(), "task",
                        "Task progress updated",
                        task.getEmployeeId() + " updated “" + task.getTitle() + "” to " + task.getProgress() + "%.",
                        task.getUpdatedAt(), "viewTasks"));
            }
        }
    }

    private void addEmployeeNotifications(List<NotificationItem> notifications, String employeeId) {
        for (Tasks task : taskRepo.findByEmployeeIdOrderByIdDesc(employeeId)) {
            notifications.add(new NotificationItem(
                    "task-assigned-" + task.getId(), "task", "New task assigned",
                    task.getTitle() + " is due " + (task.getDeadline() == null ? "on a date to be confirmed" : task.getDeadline()) + ".",
                    task.getCreatedAt(), "tasks"));
        }
        for (LeaveRequest leave : leaveRepo.findAllByEmployeeIdOrderByIdDesc(employeeId)) {
            if (!"Pending".equals(leave.getStatus())) {
                notifications.add(new NotificationItem(
                        "leave-decision-" + leave.getId(), "leave", "Leave request " + leave.getStatus().toLowerCase(),
                        leave.getType() + " leave: " + leave.getReason(), leave.getUpdatedAt(), "leave"));
            }
        }
    }
}
