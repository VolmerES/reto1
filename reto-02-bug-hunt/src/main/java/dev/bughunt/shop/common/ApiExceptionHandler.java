package dev.bughunt.shop.common;

import dev.bughunt.shop.catalog.OutOfStockException;
import dev.bughunt.shop.orders.OrderAlreadyCancelledException;
import dev.bughunt.shop.payments.PaymentDeclinedException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse invalidRequest(MethodArgumentNotValidException exception) {
        List<String> fields = exception.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getField)
                .sorted()
                .toList();
        return new ErrorResponse("The request is not valid", fields);
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse notFound(NotFoundException exception) {
        return new ErrorResponse(exception.getMessage());
    }

    @ExceptionHandler({OutOfStockException.class, OrderAlreadyCancelledException.class})
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse conflict(RuntimeException exception) {
        return new ErrorResponse(exception.getMessage());
    }

    @ExceptionHandler(PaymentDeclinedException.class)
    @ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
    public ErrorResponse paymentDeclined(PaymentDeclinedException exception) {
        return new ErrorResponse(exception.getMessage());
    }
}
