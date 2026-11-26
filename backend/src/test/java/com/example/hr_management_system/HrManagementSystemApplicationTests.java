package com.example.hr_management_system;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.hr_management_system.models.Employee_details;
import com.example.hr_management_system.repository.EmployeeLoginRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {"app.activation-mode=local", "spring.mail.username=", "spring.mail.password="})
class HrManagementSystemApplicationTests {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private EmployeeLoginRepo employeeLoginRepo;

    @BeforeEach
    void seedActiveEmployees() {
        for (int i = 1; i <= 4; i++) {
            Employee_details employee = new Employee_details();
            employee.setEmployee_id("TEST-EMP-" + i);
            employee.setName("Test Employee " + i);
            employee.setGmail("test" + i + "@example.com");
            employee.setPhone_no("900000000" + i);
            employee.setPassword("unused-test-password");
            employee.setActive(true);
            employeeLoginRepo.save(employee);
        }
    }

    private MockHttpSession session(String role, String userId) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("role", role);
        session.setAttribute("userId", userId);
        session.setAttribute("name", "Test User");
        return session;
    }

    @Test
    void leaveCanBeSubmittedListedAndReviewed() throws Exception {
        String response = mockMvc.perform(post("/leave/submit")
                        .session(session("employee", "TEST-EMP-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employeeId\":\"TEST-EMP-1\",\"type\":\"Sick\",\"reason\":\"Test request\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value("TEST-EMP-1"))
                .andExpect(jsonPath("$.status").value("Pending"))
                .andReturn().getResponse().getContentAsString();
        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(post("/leave/submit")
                        .session(session("employee", "TEST-EMP-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employeeId\":\"TEST-EMP-1\",\"type\":\"Casual\",\"reason\":\"Newer request\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/leave/employee/TEST-EMP-1").session(session("employee", "TEST-EMP-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reason").value("Newer request"))
                .andExpect(jsonPath("$[1].id").value(Long.valueOf(id)));
        mockMvc.perform(get("/leave/all").session(session("manager", "TEST-MGR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reason").value("Newer request"));
        mockMvc.perform(patch("/leave/{id}", id).session(session("manager", "TEST-MGR")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"Approved\",\"comment\":\"Reviewed\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Approved"));
    }

    @Test
    void employeeCanSignUpActivateAndSignIn() throws Exception {
        String signup = mockMvc.perform(post("/employee/Sign-up")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employee_id\":\"NEW-EMP\",\"name\":\"New Employee\",\"gmail\":\"new.employee@example.com\",\"phone_no\":\"9000000010\",\"password\":\"safe-password-123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.activationUrl").exists())
                .andReturn().getResponse().getContentAsString();
        String activationUrl = objectMapper.readTree(signup).get("activationUrl").asText();
        String token = activationUrl.substring(activationUrl.lastIndexOf('/') + 1);

        mockMvc.perform(get("/employee/accountactivation/{token}", token))
                .andExpect(status().isOk())
                .andExpect(content().string("Account activated successfully!"));
        mockMvc.perform(post("/employee/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employee_id\":\"NEW-EMP\",\"password\":\"safe-password-123\"}"))
                .andExpect(status().isOk())
                .andExpect(request().sessionAttribute("role", "employee"))
                .andExpect(jsonPath("$.user.id").value("NEW-EMP"))
                .andExpect(jsonPath("$.user.role").value("employee"));
    }

    @Test
    void managerCanSignUpActivateAndSignIn() throws Exception {
        String signup = mockMvc.perform(post("/manager/Sign-up")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"manager_id\":\"NEW-MGR\",\"name\":\"New Manager\",\"gmail\":\"new.manager@example.com\",\"phone_no\":\"9000000011\",\"password\":\"safe-password-123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.activationUrl").exists())
                .andReturn().getResponse().getContentAsString();
        String activationUrl = objectMapper.readTree(signup).get("activationUrl").asText();
        String token = activationUrl.substring(activationUrl.lastIndexOf('/') + 1);

        mockMvc.perform(get("/manager/accountactivation/{token}", token))
                .andExpect(status().isOk())
                .andExpect(content().string("Account activated successfully!"));
        mockMvc.perform(post("/manager/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"manager_id\":\"NEW-MGR\",\"password\":\"safe-password-123\"}"))
                .andExpect(status().isOk())
                .andExpect(request().sessionAttribute("role", "manager"))
                .andExpect(jsonPath("$.user.id").value("NEW-MGR"))
                .andExpect(jsonPath("$.user.role").value("manager"));
    }

    @Test
    void taskCanBeAssignedListedAndUpdated() throws Exception {
        String response = mockMvc.perform(post("/tasks/assignedTasks")
                        .session(session("manager", "TEST-MGR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employeeId\":\"TEST-EMP-2\",\"title\":\"Test task\",\"deadline\":\"2026-12-01\",\"priority\":\"Medium\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.progress").value(0))
                .andReturn().getResponse().getContentAsString();
        String id = objectMapper.readTree(response).get("id").asText();
        mockMvc.perform(get("/tasks/assignedTasks/TEST-EMP-2").session(session("employee", "TEST-EMP-2")))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].title").value("Test task"));
        mockMvc.perform(patch("/tasks/assignedTasks/{id}", id).session(session("employee", "TEST-EMP-2")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"progress\":45,\"status\":\"In Progress\",\"notes\":\"Test update\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.progress").value(45));
    }

    @Test
    void salaryCanBeCreditedAndRetrieved() throws Exception {
        mockMvc.perform(post("/salaryCreditions/credit").session(session("manager", "TEST-MGR")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employeeId\":\"TEST-EMP-3\",\"date\":\"2026-11-25\",\"amount\":1251,\"remarks\":\"Test credit\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.amount").value(1251));
        mockMvc.perform(post("/salaryCreditions/credit").session(session("manager", "TEST-MGR")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employeeId\":\"TEST-EMP-3\",\"date\":\"2026-01-01\",\"amount\":1000}"))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/salaryCreditions/employee/TEST-EMP-3").session(session("employee", "TEST-EMP-3")))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].amount").value(1251));
    }

    @Test
    void fractionalSalaryAmountsAreRejectedInsteadOfTruncated() throws Exception {
        mockMvc.perform(post("/salaryCreditions/credit").session(session("manager", "TEST-MGR")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employeeId\":\"TEST-EMP-4\",\"date\":\"2026-11-25\",\"amount\":1250.75}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void invalidLeaveAndTaskPayloadsAreRejected() throws Exception {
        mockMvc.perform(post("/leave/submit").session(session("employee", "TEST-EMP-4")).contentType(MediaType.APPLICATION_JSON).content("{\"employeeId\":\"TEST-EMP-4\"}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/tasks/assignedTasks").session(session("manager", "TEST-MGR")).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/salaryCreditions/credit").session(session("manager", "TEST-MGR")).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void apiRequiresLoginAndEmployeesCannotReadAnotherEmployeesTasks() throws Exception {
        mockMvc.perform(get("/tasks/assignedTasks/TEST-EMP-2"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/tasks/assignedTasks/TEST-EMP-2").session(session("employee", "TEST-EMP-1")))
                .andExpect(status().isForbidden());
    }

    @Test
    void assignmentAndProgressChangesCreateRoleSpecificNotifications() throws Exception {
        String response = mockMvc.perform(post("/tasks/assignedTasks").session(session("manager", "TEST-MGR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"employeeId\":\"TEST-EMP-2\",\"title\":\"Notification task\",\"deadline\":\"2026-12-01\",\"priority\":\"Medium\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/notifications").session(session("employee", "TEST-EMP-2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("New task assigned"));

        mockMvc.perform(put("/tasks/updateTask/{id}", id).session(session("employee", "TEST-EMP-2"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"progress\":55,\"status\":\"In Progress\",\"notes\":\"Progress update\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/notifications").session(session("manager", "TEST-MGR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Task progress updated"));
    }
}
