package com.openclassrooms.starterjwt.exception;

import java.time.LocalDateTime;

public class ErreurReponse {

	private int status;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();

    public ErreurReponse(int status, String message) {
        this.status = status;
        this.message = message;
    }
    
    public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
}
