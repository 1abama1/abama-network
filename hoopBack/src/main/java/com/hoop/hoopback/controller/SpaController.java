package com.hoop.hoopback.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Controller
public class SpaController {

    @RequestMapping(value = {
            "/{path:[^\\.]*}",
            "/*/{path:[^\\.]*}",
            "/**/{path:[^\\.]*}"
    })
    public String forward(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri.startsWith("/ws") || uri.startsWith("/api")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return "forward:/index.html";
    }
}
