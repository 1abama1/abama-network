package com.hoop.hoopback.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Controller
public class SpaController implements ErrorController {

    @RequestMapping("/error")
    public void handleError(HttpServletRequest request, HttpServletResponse response) throws Exception {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int statusCode = status != null ? Integer.parseInt(status.toString()) : 500;

        Throwable throwable = (Throwable) request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);

        String uri = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        boolean isSpaRoute = (statusCode == 404 || (statusCode == 500 && throwable instanceof NoResourceFoundException))
                && uri != null
                && !uri.startsWith("/api")
                && !uri.startsWith("/ws")
                && !uri.contains(".");

        if (isSpaRoute) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }

        response.setStatus(statusCode);
    }
}
