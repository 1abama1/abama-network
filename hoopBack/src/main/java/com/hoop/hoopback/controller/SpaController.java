package com.hoop.hoopback.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController implements ErrorController {

    @RequestMapping("/error")
    public void handleError(HttpServletRequest request, HttpServletResponse response) throws Exception {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int statusCode = status != null ? Integer.parseInt(status.toString()) : 500;

        if (statusCode == 404) {
            String uri = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
            if (uri != null && !uri.startsWith("/api") && !uri.startsWith("/ws") && !uri.contains(".")) {
                request.getRequestDispatcher("/index.html").forward(request, response);
                return;
            }
        }

        response.setStatus(statusCode);
    }
}
