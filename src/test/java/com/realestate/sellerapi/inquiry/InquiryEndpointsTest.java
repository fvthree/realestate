package com.realestate.sellerapi.inquiry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.sellerapi.agent.AgentRepository;
import com.realestate.sellerapi.agent.domain.Agent;
import com.realestate.sellerapi.inquiry.domain.Inquiry;
import com.realestate.sellerapi.inquiry.domain.InquiryStatus;
import com.realestate.sellerapi.property.PropertyRepository;
import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyStatus;
import com.realestate.sellerapi.property.domain.PropertyType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class InquiryEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID agentId;
    private UUID propertyId;
    private String agentToken;
    private UUID inquiryId;
    private String buyerToken;

    @BeforeEach
    void setUp() throws Exception {
        inquiryRepository.deleteAll();
        propertyRepository.deleteAll();
        agentRepository.deleteAll();

        // Create agent
        Agent agent = Agent.builder()
                .email("agent@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .name("Agent Name")
                .build();
        Agent savedAgent = agentRepository.save(agent);
        agentId = savedAgent.getId();

        // Get agent token
        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"agent@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode node = objectMapper.readTree(loginBody);
        agentToken = node.get("access_token").asText();

        // Create and publish property
        Property property = Property.builder()
                .agentId(agentId)
                .title("Test Property")
                .description("Description")
                .pricePhp(new BigDecimal("3500000"))
                .propertyType(PropertyType.valueOf("CONDO"))
                .bedrooms(2)
                .bathrooms(1)
                .floorAreaSqm(new BigDecimal("45"))
                .region("CALABARZON")
                .province("Cavite")
                .cityMunicipality("Imus")
                .barangay("Anabu")
                .postalCode("4103")
                .streetAddress("123 Main St")
                .status(PropertyStatus.PUBLISHED)
                .publishedAt(java.time.Instant.now())
                .build();
        Property savedProp = propertyRepository.save(property);
        propertyId = savedProp.getId();

        // Create inquiry and get token
        String createInquiryBody = mockMvc.perform(post("/api/public/properties/" + propertyId + "/inquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "buyer_name": "Juan Dela Cruz",
                                  "buyer_email": "juan@example.com",
                                  "buyer_phone": "+639171234567",
                                  "message": "Is this available?"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode inquiryNode = objectMapper.readTree(createInquiryBody);
        inquiryId = UUID.fromString(inquiryNode.get("inquiry_id").asText());
        buyerToken = inquiryNode.get("buyer_portal").get("token").asText();
    }

    @Test
    void buyerCanViewInquiry() throws Exception {
        mockMvc.perform(get("/api/public/inquiries/" + inquiryId)
                        .param("token", buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(inquiryId.toString()))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.buyer.buyer_name").value("Juan Dela Cruz"))
                .andExpect(jsonPath("$.messages.length()").value(1));
    }

    @Test
    void buyerCanUpdateContact() throws Exception {
        mockMvc.perform(patch("/api/public/inquiries/" + inquiryId)
                        .param("token", buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "buyer_email": "newemail@example.com",
                                  "buyer_phone": "+639188888888"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.buyer.buyer_email").value("newemail@example.com"))
                .andExpect(jsonPath("$.buyer.buyer_phone").value("+639188888888"));
    }

    @Test
    void buyerCanAddMessage() throws Exception {
        mockMvc.perform(post("/api/public/inquiries/" + inquiryId + "/messages")
                        .param("token", buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "When can I view it?"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sender_type").value("BUYER"))
                .andExpect(jsonPath("$.body").value("When can I view it?"));
    }

    @Test
    void agentCanListInquiries() throws Exception {
        mockMvc.perform(get("/api/me/inquiries")
                        .header("Authorization", "Bearer " + agentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].status").value("NEW"))
                .andExpect(jsonPath("$.meta.total").value(1));
    }

    @Test
    void agentCanFilterInquiriesByStatus() throws Exception {
        mockMvc.perform(get("/api/me/inquiries")
                        .param("status", "NEW")
                        .header("Authorization", "Bearer " + agentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void agentCanUpdateInquiryStatus() throws Exception {
        mockMvc.perform(patch("/api/me/inquiries/" + inquiryId)
                        .header("Authorization", "Bearer " + agentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "CONTACTED"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONTACTED"));
    }

    @Test
    void agentCanAddMessage() throws Exception {
        mockMvc.perform(post("/api/me/inquiries/" + inquiryId + "/messages")
                        .header("Authorization", "Bearer " + agentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "body": "Yes, available anytime!"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sender_type").value("AGENT"))
                .andExpect(jsonPath("$.body").value("Yes, available anytime!"));
    }

    @Test
    void invalidTokenReturns403() throws Exception {
        mockMvc.perform(get("/api/public/inquiries/" + inquiryId)
                        .param("token", "invalid-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void agentRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/me/inquiries"))
                .andExpect(status().isUnauthorized());
    }
}

