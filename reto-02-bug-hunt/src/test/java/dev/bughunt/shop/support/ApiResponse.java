package dev.bughunt.shop.support;

import java.util.List;

/** What the API answered: the HTTP status, the body if it went well and the wrong fields if it was a 400. */
public record ApiResponse<T>(int status, T body, List<String> invalidFields) {
}
