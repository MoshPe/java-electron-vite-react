package org.example;

import static spark.Spark.*;

public class Main {
    public static void main(String[] args) {
        port(8084); // Start backend on port 8080

        // Enable CORS
        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }

            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }

            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "http://localhost:5173");
            response.header("Access-Control-Allow-Headers", "*");
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        });

        get("/api/hello", (req, res) -> "Hello from Java Backend!");

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down Spark server...");
            stop(); // Explicitly stop the Spark server
        }));
    }
}
