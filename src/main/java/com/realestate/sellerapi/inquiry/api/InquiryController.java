package com.realestate.sellerapi.inquiry.api;

import com.realestate.sellerapi.inquiry.InquiryService;
import com.realestate.sellerapi.shared.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/properties")
public class InquiryController {

    private static final Logger log = LoggerFactory.getLogger(InquiryController.class);

    private final InquiryService inquiryService;

    InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @PostMapping("/{id}/inquiries")
    public ResponseEntity<?> createInquiry(@PathVariable("id") UUID propertyId,
                                                               @RequestBody CreateInquiryRequest request) {
        log.info("Create inquiry request: {}", request.toString());
        try {
            CreateInquiryResponse response = inquiryService.createInquiry(propertyId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, ex.getMessage()));
        }
    }
}
