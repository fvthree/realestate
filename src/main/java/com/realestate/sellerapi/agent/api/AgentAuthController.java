package com.realestate.sellerapi.agent.api;

import com.realestate.sellerapi.agent.AgentService;
import com.realestate.sellerapi.agent.InvalidCredentialsException;
import com.realestate.sellerapi.shared.ErrorResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AgentAuthController {

    private static final Logger log = LoggerFactory.getLogger(AgentAuthController.class);

    private final AgentService agentService;

    public AgentAuthController(AgentService agentService) {
        this.agentService = agentService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthLoginRequest request, HttpServletResponse response) {
        log.info("Login request: {}", request.toString());
        try {
            AuthLoginResponse authResponse = agentService.login(request.email(), request.password());

            // Set HttpOnly cookie with the access token
            Cookie cookie = new Cookie("access_token", authResponse.accessToken());
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true in production with HTTPS
            cookie.setPath("/");
            cookie.setMaxAge((int) authResponse.expiresIn());
            response.addCookie(cookie);

            return ResponseEntity.ok(authResponse);
        } catch (InvalidCredentialsException ex) {
            ErrorResponse errorResponse = new ErrorResponse(400, "Invalid credentials");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}

