package com.realestate.sellerapi.inquiry.api;

import com.realestate.sellerapi.inquiry.InquiryNotFoundException;
import com.realestate.sellerapi.inquiry.InquiryService;
import com.realestate.sellerapi.inquiry.InvalidTokenException;
import com.realestate.sellerapi.shared.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/inquiries")
public class BuyerPortalController {

    private final InquiryService inquiryService;

    public BuyerPortalController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInquiry(
            @PathVariable UUID id,
            @RequestParam String token) {
        try {
            BuyerInquiryDetailResponse response = inquiryService.getBuyerInquiry(id, token);
            return ResponseEntity.ok(response);
        } catch (InquiryNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Inquiry not found"));
        } catch (InvalidTokenException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "Invalid token"));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateContact(
            @PathVariable UUID id,
            @RequestParam String token,
            @RequestBody UpdateBuyerContactRequest request) {
        try {
            BuyerInquiryDetailResponse response = inquiryService.updateBuyerContact(id, token, request);
            return ResponseEntity.ok(response);
        } catch (InquiryNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Inquiry not found"));
        } catch (InvalidTokenException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "Invalid token"));
        }
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> addMessage(
            @PathVariable UUID id,
            @RequestParam String token,
            @RequestBody AddMessageRequest request) {
        try {
            MessageResponse response = inquiryService.addBuyerMessage(id, token, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (InquiryNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Inquiry not found"));
        } catch (InvalidTokenException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "Invalid token"));
        }
    }
}
