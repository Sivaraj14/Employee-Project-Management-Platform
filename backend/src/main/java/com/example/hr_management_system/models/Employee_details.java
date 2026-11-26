package com.example.hr_management_system.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity

public class Employee_details {

    @Id
    private String employee_id;
    private String name;
    private String gmail;
    private String phone_no;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private boolean isActive = false;
    @JsonIgnore
    private String activationId = "";

}
