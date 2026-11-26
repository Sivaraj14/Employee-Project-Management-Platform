package com.example.hr_management_system.service;

import com.example.hr_management_system.models.Employee_details;
import com.example.hr_management_system.repository.EmployeeLoginRepo;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import java.util.Properties;

@Service
@RequiredArgsConstructor
public class EmployeeLoginService {

    private final EmployeeLoginRepo employeeLoginRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${spring.mail.password:}")
    private String senderPassword;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${app.api-base-url:http://localhost:8080}")
    private String apiBaseUrl;

    @Value("${app.activation-mode:local}")
    private String activationMode;

    @Transactional(rollbackFor = MessagingException.class)
    public Employee_details saveEmployee(Employee_details employee) throws MessagingException {

        if (employee.getEmployee_id() == null || employee.getEmployee_id().isBlank()
                || employee.getName() == null || employee.getName().isBlank()
                || employee.getGmail() == null || !employee.getGmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || employee.getPhone_no() == null || employee.getPhone_no().isBlank()
                || employee.getPassword() == null || employee.getPassword().length() < 8) {
            throw new IllegalArgumentException("Enter all fields, a valid email, and a password with at least 8 characters.");
        }

        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setEmployee_id(employee.getEmployee_id().trim());
        employee.setName(employee.getName().trim());
        employee.setGmail(employee.getGmail().trim().toLowerCase());
        employee.setPhone_no(employee.getPhone_no().trim());

        String token = UUID.randomUUID().toString();

        employee.setActivationId(token);

        if (employeeLoginRepo.existsById(employee.getEmployee_id())) {
            throw new IllegalArgumentException("An account with this ID already exists.");
        }

        employeeLoginRepo.save(employee);

        if ("email".equalsIgnoreCase(activationMode)) {
            if (senderEmail == null || senderEmail.isBlank() || senderPassword == null || senderPassword.isBlank()) {
                throw new IllegalStateException("Mail credentials are not configured.");
            }
            sendActivationMail(employee.getGmail(), employee.getName(), token);
        }

        return employee;
    }

    public void sendActivationMail(String gmail, String name, String token) throws MessagingException {

        if (senderEmail == null || senderEmail.isBlank() || senderPassword == null || senderPassword.isBlank()) {
            throw new IllegalStateException("Mail credentials are not configured.");
        }
        Properties props = new Properties();
        props.put("mail.smtp.auth", true);
        props.put("mail.smtp.starttls.enable", true);
        props.put("mail.smtp.host", mailHost);
        props.put("mail.smtp.port", String.valueOf(mailPort));

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(senderEmail, senderPassword);
            }
        });

        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(senderEmail));
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(gmail));
        msg.setSubject("Activate your Employee & Project Management Platform account");

        String link = apiBaseUrl.replaceAll("/+$", "") + "/employee/accountactivation/" + token;

        msg.setContent(
                "<p>Hello " + escapeHtml(name) + ",</p>" +
                        "<p>Click below to activate your account:</p>" +
                        "<a href='" + link + "' style='padding:10px 15px; background:#4CAF50; color:white; border-radius:5px;'>Activate Account</a>",
                "text/html"
        );

        Transport.send(msg);
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    public String activateAccount(String token) {

        Employee_details emp = employeeLoginRepo.findByActivationId(token);

        if (emp == null) return "Invalid or expired activation link.";

        emp.setActive(true);
        emp.setActivationId(null);
        employeeLoginRepo.save(emp);

        return "Account activated successfully!";
    }

    public java.util.List<Employee_details> getAll() {
        return employeeLoginRepo.findAll();
    }

    public ResponseEntity<?> login(String id, String rawPassword) {
        if (id == null || id.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Enter your ID and password."));
        }
        Employee_details emp = employeeLoginRepo.findById(id).orElse(null);
        if (emp == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid ID or password."));
        }
        if (!emp.isActive()) {
            return ResponseEntity.status(403).body(java.util.Map.of("message", "Activate your account before signing in."));
        }
        if (!passwordEncoder.matches(rawPassword, emp.getPassword())) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid ID or password."));
        }
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Login successful.",
                "user", java.util.Map.of("id", emp.getEmployee_id(), "name", emp.getName(), "role", "employee")
        ));
    }

}
