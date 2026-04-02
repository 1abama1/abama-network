package com.hoop.hoopback.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ForwardController {

    // Matches any path that doesn't start with /api, /ws, or contain a dot (file extension)
    @RequestMapping(value = { "{path:(?!api|ws|static)[^\\.]*}", "/**/{path:(?!api|ws|static)[^\\.]*}" })
    public String forward() {
        return "forward:/index.html";
    }
}
