package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {
    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private UserRepository userRepository;

    private SessionService service;

    @BeforeEach
    void setUp() {
        service = new SessionService(sessionRepository, userRepository);
    }

    @Test
    void create_shouldSaveAndReturnSession() {
        Session session = new Session();
        when(sessionRepository.save(session)).thenReturn(session);

        assertSame(session, service.create(session));
        verify(sessionRepository).save(session);
    }

    @Test
    void delete_shouldDeleteById() {
        service.delete(7L);

        verify(sessionRepository).deleteById(7L);
    }

    @Test
    void findAll_shouldReturnRepositoryResults() {
        List<Session> sessions = List.of(new Session());
        when(sessionRepository.findAll()).thenReturn(sessions);

        assertSame(sessions, service.findAll());
    }

    @Test
    void getById_shouldReturnSessionOrNull() {
        Session session = new Session();
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.findById(2L)).thenReturn(Optional.empty());

        assertSame(session, service.getById(1L));
        assertNull(service.getById(2L));
    }

    @Test
    void update_shouldSetIdAndSave() {
        Session session = new Session();
        when(sessionRepository.save(session)).thenReturn(session);

        assertSame(session, service.update(12L, session));
        assertEquals(12L, session.getId());
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_shouldAddUserAndSaveSession() {
        Session session = sessionWithUsers();
        User user = user(5L);
        when(sessionRepository.findById(2L)).thenReturn(Optional.of(session));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        service.participate(2L, 5L);

        assertEquals(List.of(user), session.getUsers());
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_shouldThrowNotFoundWhenSessionOrUserDoesNotExist() {
        when(sessionRepository.findById(2L)).thenReturn(Optional.empty());
        when(userRepository.findById(5L)).thenReturn(Optional.of(user(5L)));
        assertThrows(NotFoundException.class, () -> service.participate(2L, 5L));

        when(sessionRepository.findById(2L)).thenReturn(Optional.of(sessionWithUsers()));
        when(userRepository.findById(6L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.participate(2L, 6L));
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_shouldRejectDuplicateAndNotSave() {
        Session session = sessionWithUsers(user(5L));
        when(sessionRepository.findById(2L)).thenReturn(Optional.of(session));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user(5L)));

        assertThrows(BadRequestException.class, () -> service.participate(2L, 5L));
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_shouldRemoveUserAndSave() {
        User participant = user(5L);
        User other = user(6L);
        Session session = sessionWithUsers(participant, other);
        when(sessionRepository.findById(2L)).thenReturn(Optional.of(session));

        service.noLongerParticipate(2L, 5L);

        assertEquals(List.of(other), session.getUsers());
        verify(sessionRepository).save(session);
        verifyNoInteractions(userRepository);
    }

    @Test
    void noLongerParticipate_shouldRejectMissingSessionOrParticipant() {
        when(sessionRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.noLongerParticipate(2L, 5L));

        when(sessionRepository.findById(2L)).thenReturn(Optional.of(sessionWithUsers()));
        assertThrows(BadRequestException.class, () -> service.noLongerParticipate(2L, 5L));
        verify(sessionRepository, never()).save(any());
    }

    private Session sessionWithUsers(User... users) {
        return Session.builder().users(new ArrayList<>(List.of(users))).build();
    }

    private User user(Long id) {
        User user = new User("person" + id + "@example.com", "Lovelace", "Ada", "password", false);
        user.setId(id);
        return user;
    }
}
