package dev.bughunt.shop.support;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
record ErrorView(String error, List<String> fields) {
}
