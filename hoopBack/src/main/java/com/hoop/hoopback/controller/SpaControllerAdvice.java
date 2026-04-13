package com.hoop.hoopback.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@ControllerAdvice
public class SpaControllerAdvice {

    @ExceptionHandler(NoResourceFoundException.class)
    public String handleNoResourceFound(NoResourceFoundException ex, HttpServletRequest request) throws NoResourceFoundException {
        String uri = request.getRequestURI();
        if (!uri.startsWith("/api") && !uri.startsWith("/ws") && !uri.contains(".")) {
            return "forward:/index.html";
        }
        throw ex;
    }
}
