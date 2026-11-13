package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {
    @Mock
    private UserRepository repository;
    @InjectMocks
    private UserDetailsServiceImpl service;

    @Test
    void loadUserByUsername_shouldMapUserFields() {
        User user = new User("person@example.com", "Lovelace", "Ada", "encoded", true);
        user.setId(1L);
        when(repository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        UserDetailsImpl details = (UserDetailsImpl) service.loadUserByUsername(user.getEmail());

        assertEquals(user.getId(), details.getId());
        assertEquals(user.getEmail(), details.getUsername());
        assertEquals(user.getFirstName(), details.getFirstName());
        assertEquals(user.getLastName(), details.getLastName());
        assertEquals(user.getPassword(), details.getPassword());
    }

    @Test
    void loadUserByUsername_shouldThrowWhenUserDoesNotExist() {
        when(repository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> service.loadUserByUsername("missing@example.com"));

        assertEquals("User Not Found with email: missing@example.com", exception.getMessage());
    }
}
