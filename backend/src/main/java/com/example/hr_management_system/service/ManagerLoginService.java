package com.example.hr_management_system.service;

import com.example.hr_management_system.models.Manager_details;
import com.example.hr_management_system.repository.ManagerLoginRepo;
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
public class ManagerLoginService {

    private final ManagerLoginRepo managerLoginRepo;
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
    public Manager_details saveManager(Manager_details manager) throws MessagingException {

        if (manager.getManager_id() == null || manager.getManager_id().isBlank()
                || manager.getName() == null || manager.getName().isBlank()
                || manager.getGmail() == null || !manager.getGmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || manager.getPhone_no() == null || manager.getPhone_no().isBlank()
                || manager.getPassword() == null || manager.getPassword().length() < 8) {
            throw new IllegalArgumentException("Enter all fields, a valid email, and a password with at least 8 characters.");
        }

        manager.setPassword(passwordEncoder.encode(manager.getPassword()));
        manager.setManager_id(manager.getManager_id().trim());
        manager.setName(manager.getName().trim());
        manager.setGmail(manager.getGmail().trim().toLowerCase());
        manager.setPhone_no(manager.getPhone_no().trim());

        String token = UUID.randomUUID().toString();

        manager.setActivationId(token);

        if (managerLoginRepo.existsById(manager.getManager_id())) {
            throw new IllegalArgumentException("An account with this ID already exists.");
        }

        managerLoginRepo.save(manager);

        if ("email".equalsIgnoreCase(activationMode)) {
            if (senderEmail == null || senderEmail.isBlank() || senderPassword == null || senderPassword.isBlank()) {
                throw new IllegalStateException("Mail credentials are not configured.");
            }
            sendActivationMail(manager.getGmail(), manager.getName(), token);
        }

        return manager;
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
        msg.setSubject("Activate your Employee & Project Management Platform manager account");

        String link = apiBaseUrl.replaceAll("/+$", "") + "/manager/accountactivation/" + token;

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

        Manager_details manager = managerLoginRepo.findByActivationId(token);

        if (manager == null) return "Invalid or expired activation link.";

        manager.setActive(true);
        manager.setActivationId(null);
        managerLoginRepo.save(manager);

        return "Account activated successfully!";
    }

    public java.util.List<Manager_details> getAll() {
        return managerLoginRepo.findAll();
    }

    public ResponseEntity<?> login(String id, String rawPassword) {
        if (id == null || id.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Enter your ID and password."));
        }
        Manager_details manager = managerLoginRepo.findById(id).orElse(null);
        if (manager == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid ID or password."));
        }
        if (!manager.isActive()) {
            return ResponseEntity.status(403).body(java.util.Map.of("message", "Activate your account before signing in."));
        }
        if (!passwordEncoder.matches(rawPassword, manager.getPassword())) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid ID or password."));
        }
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Login successful.",
                "user", java.util.Map.of("id", manager.getManager_id(), "name", manager.getName(), "role", "manager")
        ));
    }

}
