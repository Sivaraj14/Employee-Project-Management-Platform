package com.example.hr_management_system.dto;

import lombok.Data;

@Data
public class EmployeeTaskUpdate {

    private int progress = 0;
    private String status = "Not Started";
    private String notes;

}
