package com.realestate.sellerapi.agent.api;

public record AuthLoginRequest(
        String email,
        String password
) {
}

