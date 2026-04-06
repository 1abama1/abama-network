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
            "{path:(?!api|ws|static|assets)[^\\.]*}",
            "/**/{path:(?!api|ws|static|assets)[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
