package com.example.hr_management_system.dto;

import java.time.LocalDateTime;

public record NotificationItem(
        String id,
        String type,
        String title,
        String message,
        LocalDateTime createdAt,
        String destination
) { }
