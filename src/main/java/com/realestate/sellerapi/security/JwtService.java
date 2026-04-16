package com.realestate.sellerapi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final String issuer;
    private final long expirationSeconds;

    public JwtService(@Value("${security.jwt.secret}") String secret,
                      @Value("${security.jwt.issuer}") String issuer,
                      @Value("${security.jwt.expiration-seconds}") long expirationSeconds) {
        this.signingKey = buildSigningKey(secret);
        this.issuer = issuer;
        this.expirationSeconds = expirationSeconds;
    }

    public String generateToken(UUID agentId, String email) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expirationSeconds);
        return Jwts.builder()
                .setSubject(agentId.toString())
                .setIssuer(issuer)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiresAt))
                .claim("email", email)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public AgentPrincipal parseToken(String token) {
        Jws<Claims> claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseClaimsJws(token);

        String subject = claims.getBody().getSubject();
        String email = claims.getBody().get("email", String.class);
        return new AgentPrincipal(UUID.fromString(subject), email);
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    private SecretKey buildSigningKey(String secret) {
        byte[] raw;
        if (secret.startsWith("base64:")) {
            raw = Decoders.BASE64.decode(secret.substring("base64:".length()));
        } else {
            raw = secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(raw);
    }
}

