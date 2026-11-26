package com.example.hr_management_system.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @GetMapping("/session")
    public ResponseEntity<?> session(HttpServletRequest request) {
        var responseHeaders = new org.springframework.http.HttpHeaders();
        responseHeaders.setCacheControl("no-store");
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).headers(responseHeaders).body(Map.of("message", "You are not signed in."));
        }
        return ResponseEntity.ok().headers(responseHeaders).body(Map.of("user", Map.of(
                "id", session.getAttribute("userId"),
                "name", session.getAttribute("name"),
                "role", session.getAttribute("role"))));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
