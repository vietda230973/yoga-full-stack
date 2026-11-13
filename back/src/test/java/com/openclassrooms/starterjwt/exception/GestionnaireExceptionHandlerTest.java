package com.openclassrooms.starterjwt.exception;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GestionnaireExceptionHandlerTest {
    private final GestionnaireExceptionHandler handler = new GestionnaireExceptionHandler();

    @Test
    void gererEntiteIntrouvable_shouldReturnNotFoundResponse() {
        ResponseEntity<ErreurReponse> response =
                handler.gererEntiteIntrouvable(new EntityNotFoundException("missing"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getBody().getStatus());
        assertEquals("missing", response.getBody().getMessage());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void gererNumberFormatErreur_shouldReturnBadRequestResponse() {
        ResponseEntity<?> response = handler.gererNumberFormatErreur(new NumberFormatException("bad id"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ErreurReponse body = (ErreurReponse) response.getBody();
        assertEquals(HttpStatus.BAD_REQUEST.value(), body.getStatus());
        assertEquals("bad id", body.getMessage());
    }

    @Test
    void gererErreurGenerique_shouldNotExposeInternalExceptionMessage() {
        ResponseEntity<ErreurReponse> response = handler.gererErreurGenerique(new IllegalStateException("secret"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), response.getBody().getStatus());
        assertEquals("Une erreur interne est survenue.", response.getBody().getMessage());
    }

    @Test
    void handleException_shouldCompleteNormally() {
        assertDoesNotThrow(handler::handleException);
    }
}
