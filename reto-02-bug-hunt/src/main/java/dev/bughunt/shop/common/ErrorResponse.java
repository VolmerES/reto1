package dev.bughunt.shop.common;

import java.util.List;

public record ErrorResponse(String error, List<String> fields) {

    public ErrorResponse(String error) {
        this(error, List.of());
    }
}
