package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionControllerTest {
    @Mock
    private SessionService service;
    @Mock
    private SessionMapper mapper;

    private SessionController controller;

    @BeforeEach
    void setUp() {
        controller = new SessionController(service, mapper);
    }

    @Test
    void findById_shouldReturnDtoOrNotFound() {
        Session session = new Session();
        SessionDto dto = new SessionDto();
        when(service.getById(1L)).thenReturn(session);
        when(mapper.toDto(session)).thenReturn(dto);

        assertSame(dto, controller.findById("1").getBody());
        when(service.getById(2L)).thenReturn(null);
        assertEquals(HttpStatus.NOT_FOUND, controller.findById("2").getStatusCode());
    }

    @Test
    void findAll_shouldMapAllSessions() {
        List<Session> sessions = List.of(new Session());
        List<SessionDto> dtos = List.of(new SessionDto());
        when(service.findAll()).thenReturn(sessions);
        when(mapper.toDto(sessions)).thenReturn(dtos);

        assertSame(dtos, controller.findAll().getBody());
    }

    @Test
    void create_shouldMapSaveAndReturnCreatedSession() {
        SessionDto input = new SessionDto();
        Session entity = new Session();
        Session saved = new Session();
        SessionDto output = new SessionDto();
        when(mapper.toEntity(input)).thenReturn(entity);
        when(service.create(entity)).thenReturn(saved);
        when(mapper.toDto(saved)).thenReturn(output);

        assertSame(output, controller.create(input).getBody());
    }

    @Test
    void update_shouldParseIdMapAndReturnUpdatedSession() {
        SessionDto input = new SessionDto();
        Session entity = new Session();
        Session saved = new Session();
        SessionDto output = new SessionDto();
        when(mapper.toEntity(input)).thenReturn(entity);
        when(service.update(4L, entity)).thenReturn(saved);
        when(mapper.toDto(saved)).thenReturn(output);

        assertSame(output, controller.update("4", input).getBody());
    }

    @Test
    void delete_shouldReturnNotFoundOrDeleteAndReturnOk() {
        when(service.getById(1L)).thenReturn(null);
        assertEquals(HttpStatus.NOT_FOUND, controller.save("1").getStatusCode());
        verify(service, never()).delete(anyLong());

        when(service.getById(2L)).thenReturn(new Session());
        ResponseEntity<?> response = controller.save("2");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(service).delete(2L);
    }

    @Test
    void participate_shouldDelegateAndReturnOk() {
        ResponseEntity<?> response = controller.participate("2", "3");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(service).participate(2L, 3L);
    }

    @Test
    void noLongerParticipate_shouldDelegateAndReturnOk() {
        ResponseEntity<?> response = controller.noLongerParticipate("2", "3");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(service).noLongerParticipate(2L, 3L);
    }
}
