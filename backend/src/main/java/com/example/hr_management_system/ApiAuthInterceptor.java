package com.example.hr_management_system;

import com.example.hr_management_system.repository.LeaveRepo;
import com.example.hr_management_system.repository.TaskRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ApiAuthInterceptor implements HandlerInterceptor {
    private final TaskRepo taskRepo;
    private final LeaveRepo leaveRepo;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method) || isPublic(path, method)) return true;

        String role = stringAttribute(request, "role");
        String userId = stringAttribute(request, "userId");
        if (role == null || userId == null) return reject(response, 401, "Please sign in to continue.");

        response.setHeader("Cache-Control", "no-store");
        boolean allowed = isAllowed(path, method, role, userId);
        if (!allowed) return reject(response, 403, "You do not have permission to access this resource.");
        return true;
    }

    private boolean isPublic(String path, String method) {
        return ("POST".equalsIgnoreCase(method) && (
                path.equals("/employee/login") || path.equals("/manager/login")
                        || path.equals("/employee/Sign-up") || path.equals("/employee/post")
                        || path.equals("/manager/Sign-up") || path.equals("/manager/post")))
                || ("GET".equalsIgnoreCase(method) && (
                path.startsWith("/employee/accountactivation/") || path.startsWith("/manager/accountactivation/")));
    }

    private boolean isAllowed(String path, String method, String role, String userId) {
        if (path.startsWith("/notifications")) return path.equals("/notifications") && "GET".equalsIgnoreCase(method);

        if (path.startsWith("/employee/")) {
            if (path.equals("/employee/get")) return isManager(role) && "GET".equalsIgnoreCase(method);
            return false;
        }
        if (path.startsWith("/manager/")) {
            return path.equals("/manager/get") && isManager(role) && "GET".equalsIgnoreCase(method);
        }
        if (path.startsWith("/tasks/")) return tasksAllowed(path, method, role, userId);
        if (path.startsWith("/leave/")) return leaveAllowed(path, method, role, userId);
        if (path.startsWith("/salaryCreditions/")) return salaryAllowed(path, method, role, userId);
        return false;
    }

    private boolean tasksAllowed(String path, String method, String role, String userId) {
        if ("POST".equalsIgnoreCase(method) && (path.equals("/tasks/assignedTasks") || path.equals("/tasks/assignTask"))) return isManager(role);
        if ("GET".equalsIgnoreCase(method) && (path.equals("/tasks/all") || path.equals("/tasks/assignedTasks/all"))) return isManager(role);
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/tasks/assignedTasks/")) {
            String employeeId = path.substring("/tasks/assignedTasks/".length());
            return isManager(role) || (isEmployee(role) && userId.equals(employeeId));
        }
        if ("PUT".equalsIgnoreCase(method) && path.startsWith("/tasks/updateTask/")) {
            return isEmployee(role) && ownsTask(path.substring("/tasks/updateTask/".length()), userId);
        }
        if ("PATCH".equalsIgnoreCase(method) && path.startsWith("/tasks/assignedTasks/")) {
            return isEmployee(role) && ownsTask(path.substring("/tasks/assignedTasks/".length()), userId);
        }
        return "PUT".equalsIgnoreCase(method) && path.startsWith("/tasks/review/") && isManager(role);
    }

    private boolean leaveAllowed(String path, String method, String role, String userId) {
        if ("POST".equalsIgnoreCase(method) && path.equals("/leave/submit")) return isEmployee(role);
        if ("GET".equalsIgnoreCase(method) && path.equals("/leave/all")) return isManager(role);
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/leave/employee/")) {
            String employeeId = path.substring("/leave/employee/".length());
            return isManager(role) || (isEmployee(role) && userId.equals(employeeId));
        }
        if (("PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method))
                && path.matches("/leave/\\d+")) return isManager(role);
        return false;
    }

    private boolean salaryAllowed(String path, String method, String role, String userId) {
        if ("POST".equalsIgnoreCase(method) && (path.equals("/salaryCreditions/credit") || path.equals("/salaryCreditions"))) return isManager(role);
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/salaryCreditions/employee/")) {
            String employeeId = path.substring("/salaryCreditions/employee/".length());
            return isManager(role) || (isEmployee(role) && userId.equals(employeeId));
        }
        return false;
    }

    private boolean ownsTask(String taskId, String employeeId) {
        try {
            return taskRepo.findById(Long.parseLong(taskId))
                    .map(task -> employeeId.equals(task.getEmployeeId())).orElse(false);
        } catch (NumberFormatException exception) {
            return false;
        }
    }

    private boolean reject(HttpServletResponse response, int status, String message) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), Map.of("message", message));
        return false;
    }

    private String stringAttribute(HttpServletRequest request, String name) {
        Object value = request.getSession(false) == null ? null : request.getSession(false).getAttribute(name);
        return value instanceof String string ? string : null;
    }

    private boolean isEmployee(String role) { return "employee".equals(role); }
    private boolean isManager(String role) { return "manager".equals(role); }
}
