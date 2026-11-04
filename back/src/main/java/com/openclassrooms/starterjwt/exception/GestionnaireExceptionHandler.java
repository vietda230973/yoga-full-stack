package com.openclassrooms.starterjwt.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;

@RestControllerAdvice
public class GestionnaireExceptionHandler {
    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    @ExceptionHandler(CustomException1.class)
    public void handleException() {
        // ...
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErreurReponse> gererEntiteIntrouvable(EntityNotFoundException ex) {
        ErreurReponse erreur = new ErreurReponse(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erreur);
    }
    
    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<?> gererNumberFormatErreur(NumberFormatException ex) {
    	ErreurReponse erreur = new ErreurReponse(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return ResponseEntity.badRequest().body(erreur);
    }
    
    

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErreurReponse> gererErreurGenerique(Exception ex) {
        ErreurReponse erreur = new ErreurReponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Une erreur interne est survenue."
        );
        // Log complet côté serveur pour debug, mais message générique renvoyé au client
        // logger.error("Erreur inattendue", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erreur);
    }
}