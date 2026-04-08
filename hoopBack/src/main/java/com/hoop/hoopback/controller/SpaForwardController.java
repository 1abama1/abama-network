package com.hoop.hoopback.controller;
 
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
 
@Controller
public class SpaForwardController {
 
    @RequestMapping(value = { "/{path:[^\\.]*}", "/**/{path:[^\\.]*}" })
    public String redirect() {
        // Forward to home page so that React Router can take care of the rest
        return "forward:/";
    }
}
