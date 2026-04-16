package com.realestate.sellerapi.agent.api;

import com.realestate.sellerapi.agent.AgentNotFoundException;
import com.realestate.sellerapi.agent.AgentService;
import com.realestate.sellerapi.security.AgentPrincipal;
import com.realestate.sellerapi.shared.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class AgentMeController {

    private final AgentService agentService;

    public AgentMeController(AgentService agentService) {
        this.agentService = agentService;
    }

    @GetMapping
    public ResponseEntity<?> getMe(@AuthenticationPrincipal AgentPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
        try {
            return ResponseEntity.ok(agentService.getMe(principal.agentId()));
        } catch (AgentNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Agent not found"));
        }
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal AgentPrincipal principal,
                                                         @RequestBody UpdateAgentProfileRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
        try {
            return ResponseEntity.ok(agentService.updateProfile(principal.agentId(), request));
        } catch (AgentNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Agent not found"));
        }
    }
}

