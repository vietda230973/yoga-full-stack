package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.Arrays;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {
    private static final String SECRET = Base64.getEncoder().encodeToString(new byte[64]);
    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 60_000);
    }

    @Test
    void generateJwtToken_shouldContainUsernameAndBeValid() {
        UserDetailsImpl principal = UserDetailsImpl.builder().username("person@example.com").build();
        var authentication = new UsernamePasswordAuthenticationToken(principal, null);

        String token = jwtUtils.generateJwtToken(authentication);

        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("person@example.com", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void validateJwtToken_shouldRejectMalformedEmptyAndInvalidSignatureTokens() {
        assertFalse(jwtUtils.validateJwtToken("not-a-jwt"));
        assertFalse(jwtUtils.validateJwtToken(""));

        byte[] otherSecretBytes = new byte[64];
        Arrays.fill(otherSecretBytes, (byte) 1);
        String otherSecretToken = Jwts.builder()
                .setSubject("person@example.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(SignatureAlgorithm.HS512, Base64.getEncoder().encodeToString(otherSecretBytes))
                .compact();
        assertFalse(jwtUtils.validateJwtToken(otherSecretToken));
    }

    @Test
    void validateJwtToken_shouldRejectExpiredToken() {
        String expiredToken = Jwts.builder()
                .setSubject("person@example.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 120_000))
                .setExpiration(new Date(System.currentTimeMillis() - 60_000))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();

        assertFalse(jwtUtils.validateJwtToken(expiredToken));
    }
}
