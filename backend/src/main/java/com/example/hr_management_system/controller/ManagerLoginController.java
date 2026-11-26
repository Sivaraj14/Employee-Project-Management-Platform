package com.example.hr_management_system.controller;

import com.example.hr_management_system.models.Manager_details;
import com.example.hr_management_system.service.ManagerLoginService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/manager")
@RequiredArgsConstructor
public class ManagerLoginController {

    @Value("${app.api-base-url:http://localhost:8080}")
    private String apiBaseUrl;

    private final ManagerLoginService managerLoginService;

    @GetMapping("/get")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(managerLoginService.getAll());
    }

    @PostMapping("/Sign-up")
    public ResponseEntity<?> signup(@RequestBody Manager_details manager) {
        try {
            Manager_details saved = managerLoginService.saveManager(manager);
            String activationUrl = apiBaseUrl.replaceAll("/+$", "") + "/manager/accountactivation/" + saved.getActivationId();
            return ResponseEntity.status(201).body(java.util.Map.of(
                    "message", "Account created. Activate it using the link sent to your email.",
                    "activationUrl", activationUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (MessagingException | IllegalStateException e) {
            return ResponseEntity.status(503).body(java.util.Map.of("message", "Account activation email could not be sent. Check the mail configuration and try again."));
        }
    }

    @GetMapping("/accountactivation/{token}")
    public ResponseEntity<?> activate(@PathVariable String token) {
        return ResponseEntity.ok(managerLoginService.activateAccount(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Manager_details req, HttpServletRequest request) {
        ResponseEntity<?> result = managerLoginService.login(req.getManager_id(), req.getPassword());
        if (result.getStatusCode().is2xxSuccessful() && result.getBody() instanceof Map<?, ?> payload
                && payload.get("user") instanceof Map<?, ?> user) {
            HttpSession session = request.getSession(true);
            request.changeSessionId();
            session.setAttribute("userId", user.get("id"));
            session.setAttribute("name", user.get("name"));
            session.setAttribute("role", "manager");
        }
        return result;
    }

}
