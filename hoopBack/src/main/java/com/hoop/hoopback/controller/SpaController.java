package com.hoop.hoopback.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to handle Single Page Application (SPA) routing.
 * Any request that is not for the API, WebSocket, or static files (with dots)
 * will be forwarded to index.html.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
            "/{path:(?!api|ws|static|assets)[^\\.]*}",
            "/{root:(?!api|ws|static|assets)[^/]+}/**/{path:[^\\.]*}"
    })
    public String forward() {
        // Exclude API, WebSocket, and static assets from being caught by the SPA forwarder
        // Note: Spring Security will handle the actual access control, but we must
        // ensure we don't accidentally forward /api calls to index.html
        return "forward:/index.html";
    }
}
