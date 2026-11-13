package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository repository;

    private UserService service;

    @BeforeEach
    void setUp() {
        service = new UserService(repository);
    }

    @Test
    void delete_shouldDeleteById() {
        service.delete(3L);

        verify(repository).deleteById(3L);
    }

    @Test
    void findById_shouldReturnUserOrNull() {
        User user = new User();
        when(repository.findById(1L)).thenReturn(Optional.of(user));
        when(repository.findById(2L)).thenReturn(Optional.empty());

        assertSame(user, service.findById(1L));
        assertNull(service.findById(2L));
    }

    @Test
    void save_shouldDelegateToRepository() {
        User user = new User();

        service.save(user);

        verify(repository).save(user);
    }

    @Test
    void findByEmail_shouldReturnRepositoryResult() {
        User user = new User();
        when(repository.findByEmail("person@example.com")).thenReturn(Optional.of(user));

        assertEquals(Optional.of(user), service.findByEmail("person@example.com"));
    }

    @Test
    void existsByEmail_shouldReturnRepositoryResult() {
        when(repository.existsByEmail("person@example.com")).thenReturn(true);

        assertTrue(service.existsByEmail("person@example.com"));
    }
}
