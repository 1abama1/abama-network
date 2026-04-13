package com.hoop.hoopback.controller;

import org.springframework.boot.web.servlet.error.ErrorViewResolver;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@Component
public class SpaErrorViewResolver implements ErrorViewResolver {

    @Override
    public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
        if (status != HttpStatus.NOT_FOUND) {
            return null;
        }

        String path = (String) model.get("path");
        if (path == null || path.startsWith("/api") || path.startsWith("/ws") || path.contains(".")) {
            return null;
        }

        return new ModelAndView("forward:/index.html", model);
    }
}
