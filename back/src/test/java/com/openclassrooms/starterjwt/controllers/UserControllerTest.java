package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {
    @Mock
    private UserService service;
    @Mock
    private UserMapper mapper;

    private UserController controller;

    @BeforeEach
    void setUp() {
        controller = new UserController(service, mapper);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void findById_shouldReturnDtoOrNotFound() {
        User user = new User();
        UserDto dto = new UserDto();
        when(service.findById(1L)).thenReturn(user);
        when(mapper.toDto(user)).thenReturn(dto);

        assertSame(dto, controller.findById("1").getBody());
        when(service.findById(2L)).thenReturn(null);
        assertEquals(HttpStatus.NOT_FOUND, controller.findById("2").getStatusCode());
    }

    @Test
    void delete_shouldReturnNotFoundWhenUserIsMissing() {
        when(service.findById(1L)).thenReturn(null);

        assertEquals(HttpStatus.NOT_FOUND, controller.save("1").getStatusCode());
        verify(service, never()).delete(anyLong());
    }

    @Test
    void delete_shouldRejectDeletingAnotherUser() {
        User user = new User().setEmail("owner@example.com");
        when(service.findById(1L)).thenReturn(user);
        authenticateAs("other@example.com");

        assertEquals(HttpStatus.UNAUTHORIZED, controller.save("1").getStatusCode());
        verify(service, never()).delete(anyLong());
    }

    @Test
    void delete_shouldDeleteAuthenticatedUser() {
        User user = new User().setEmail("owner@example.com");
        when(service.findById(1L)).thenReturn(user);
        authenticateAs("owner@example.com");

        assertEquals(HttpStatus.OK, controller.save("1").getStatusCode());
        verify(service).delete(1L);
    }

    private void authenticateAs(String email) {
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername(email)
                .password("password")
                .authorities("USER")
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }
}
