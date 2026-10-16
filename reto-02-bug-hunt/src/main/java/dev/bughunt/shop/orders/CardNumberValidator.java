package dev.bughunt.shop.orders;

import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

/** Catches mistyped card numbers (Luhn check) before we bother the bank. */
@Component
public class CardNumberValidator implements Validator {

    @Override
    public boolean supports(Class<?> type) {
        return PlaceOrderRequest.class.isAssignableFrom(type);
    }

    @Override
    public void validate(Object target, Errors errors) {
        String card = ((PlaceOrderRequest) target).card();
        if (card != null && !isValidCardNumber(card.replace(" ", ""))) {
            errors.rejectValue("card", "card.invalid", "This is not a valid card number");
        }
    }

    private boolean isValidCardNumber(String digits) {
        if (!digits.matches("\\d{12,19}")) {
            return false;
        }
        int sum = 0;
        boolean doubleIt = false;
        for (int i = digits.length() - 1; i >= 0; i--) {
            int digit = digits.charAt(i) - '0';
            if (doubleIt) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            doubleIt = !doubleIt;
        }
        return sum % 10 == 0;
    }
}
