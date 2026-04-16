package com.realestate.sellerapi.property;

public class InvalidPropertyStatusException extends RuntimeException {
    public InvalidPropertyStatusException(String message) {
        super(message);
    }
}

