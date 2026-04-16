package com.realestate.sellerapi.agent.api;

import com.realestate.sellerapi.agent.AgentNotFoundException;
import com.realestate.sellerapi.agent.AgentService;
import com.realestate.sellerapi.shared.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/agent")
public class PublicAgentController {

    private final AgentService agentService;

    public PublicAgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @GetMapping
    public ResponseEntity<?> getPublicProfile() {
        try {
            return ResponseEntity.ok(agentService.getPublicProfile());
        } catch (AgentNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Agent not found"));
        }
    }
}
