package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtils jwtUtils;
    @Mock
    private UserService userService;

    private AuthController controller;

    @BeforeEach
    void setUp() {
        controller = new AuthController(authenticationManager, passwordEncoder, jwtUtils, userService);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticateUser_shouldReturnJwtAndAdminFlag() {
        LoginRequest request = new LoginRequest();
        request.setEmail("person@example.com");
        request.setPassword("secret");
        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L).username("person@example.com").firstName("Ada").lastName("Lovelace").build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");
        when(userService.findByEmail("person@example.com"))
                .thenReturn(Optional.of(new User("person@example.com", "Lovelace", "Ada", "encoded", true)));

        var response = controller.authenticateUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        JwtResponse body = (JwtResponse) response.getBody();
        assertNotNull(body);
        assertEquals("jwt-token", body.getToken());
        assertEquals("person@example.com", body.getUsername());
        assertTrue(body.getAdmin());
        assertSame(authentication, SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void authenticateUser_shouldDefaultAdminFlagWhenUserRecordIsAbsent() {
        LoginRequest request = new LoginRequest();
        request.setEmail("person@example.com");
        request.setPassword("secret");
        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L).username("person@example.com").build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");
        when(userService.findByEmail("person@example.com")).thenReturn(Optional.empty());

        JwtResponse body = (JwtResponse) controller.authenticateUser(request).getBody();

        assertNotNull(body);
        assertFalse(body.getAdmin());
    }

    @Test
    void registerUser_shouldReturnBadRequestForExistingEmail() {
        SignupRequest request = signupRequest();
        when(userService.existsByEmail(request.getEmail())).thenReturn(true);

        var response = controller.registerUser(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error: Email is already taken!", ((MessageResponse) response.getBody()).getMessage());
        verify(userService, never()).save(any());
    }

    @Test
    void registerUser_shouldEncodeAndSaveNewUser() {
        SignupRequest request = signupRequest();
        when(userService.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-secret");

        var response = controller.registerUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User registered successfully!", ((MessageResponse) response.getBody()).getMessage());
        verify(userService).save(argThat(user ->
                user.getEmail().equals(request.getEmail())
                        && user.getFirstName().equals("Ada")
                        && user.getLastName().equals("Lovelace")
                        && user.getPassword().equals("encoded-secret")
                        && !user.isAdmin()));
    }

    private SignupRequest signupRequest() {
        SignupRequest request = new SignupRequest();
        request.setEmail("person@example.com");
        request.setFirstName("Ada");
        request.setLastName("Lovelace");
        request.setPassword("secret123");
        return request;
    }
}
