package com.example.hr_management_system.controller;

import com.example.hr_management_system.dto.NotificationItem;
import com.example.hr_management_system.service.NotificationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationItem> getNotifications(HttpSession session) {
        return notificationService.forUser(
                String.valueOf(session.getAttribute("role")),
                String.valueOf(session.getAttribute("userId")));
    }
}
