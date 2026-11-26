package com.example.hr_management_system.dto;

import lombok.Data;

@Data
public class LeaveUpdateRequest {

    private String status;
    private String comment;

}
