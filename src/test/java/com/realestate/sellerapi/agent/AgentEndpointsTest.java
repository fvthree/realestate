package com.realestate.sellerapi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.sellerapi.agent.domain.Agent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AgentEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        agentRepository.deleteAll();
        Agent agent = Agent.builder()
                .email("agent@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .name("Agent Name")
                .phone("+639171234567")
                .bio("About me")
                .serviceAreas("Cavite, Metro Manila")
                .avatarUrl("https://example.com/avatar.jpg")
                .facebookUrl("https://facebook.com/agent")
                .instagramUrl("https://instagram.com/agent")
                .websiteUrl("https://agent.example.com")
                .build();
        agentRepository.save(agent);
    }

    @Test
    void loginReturnsJwt() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.expires_in").value(3600));
    }

    @Test
    void getMeRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getMeReturnsProfile() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(get("/api/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("agent@example.com"))
                .andExpect(jsonPath("$.name").value("Agent Name"))
                .andExpect(jsonPath("$.socials.facebook_url").value("https://facebook.com/agent"));
    }

    @Test
    void updateProfilePatchesFields() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(patch("/api/me/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New Name\",\"phone\":\"+639188888888\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"))
                .andExpect(jsonPath("$.phone").value("+639188888888"));

        Agent saved = agentRepository.findByEmail("agent@example.com").orElseThrow();
        assertThat(saved.getName()).isEqualTo("New Name");
        assertThat(saved.getPhone()).isEqualTo("+639188888888");
    }

    @Test
    void publicProfileIsAccessible() throws Exception {
        mockMvc.perform(get("/api/public/agent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Agent Name"))
                .andExpect(jsonPath("$.socials.instagram_url").value("https://instagram.com/agent"))
                .andExpect(jsonPath("$.email").doesNotExist());
    }

    private String loginAndGetToken() throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode node = objectMapper.readTree(body);
        return node.get("access_token").asText();
    }
}

