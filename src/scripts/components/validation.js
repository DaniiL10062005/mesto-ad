function showInputError(input, error, settings) {
  input.classList.add(settings.inputErrorClass);
  input.setAttribute("aria-invalid", "true");
  error.textContent = input.validationMessage;
  error.classList.add(settings.errorClass);
}

function hideInputError(input, error, settings) {
  input.classList.remove(settings.inputErrorClass);
  input.removeAttribute("aria-invalid");
  error.textContent = "";
  error.classList.remove(settings.errorClass);
}

function checkInputValidity(input, error, settings) {
  input.setCustomValidity(input.validity.patternMismatch ? input.dataset.errorMessage || "" : "");
  if (input.validity.valid) {
    hideInputError(input, error, settings);
  } else {
    showInputError(input, error, settings);
  }
}

function hasInvalidInput(inputs) {
  return inputs.some((input) => !input.validity.valid);
}

function disableSubmitButton(button, settings) {
  button.disabled = true;
  button.classList.add(settings.inactiveButtonClass);
}

function enableSubmitButton(button, settings) {
  button.disabled = false;
  button.classList.remove(settings.inactiveButtonClass);
}

function toggleButtonState(inputs, button, settings) {
  if (hasInvalidInput(inputs)) {
    disableSubmitButton(button, settings);
  } else {
    enableSubmitButton(button, settings);
  }
}

function getInputError(form, input) {
  return form.querySelector(`#${CSS.escape(input.id)}-error`);
}

function setEventListeners(form, settings) {
  const inputs = Array.from(form.querySelectorAll(settings.inputSelector));
  const button = form.querySelector(settings.submitButtonSelector);
  disableSubmitButton(button, settings);
  inputs.forEach((input) => {
    const error = getInputError(form, input);
    input.addEventListener("input", () => {
      checkInputValidity(input, error, settings);
      toggleButtonState(inputs, button, settings);
    });
  });
}

export function clearValidation(form, settings) {
  form.querySelectorAll(settings.inputSelector).forEach((input) => {
    input.setCustomValidity("");
    hideInputError(input, getInputError(form, input), settings);
  });
  disableSubmitButton(form.querySelector(settings.submitButtonSelector), settings);
}

export function enableValidation(settings) {
  document.querySelectorAll(settings.formSelector).forEach((form) => {
    setEventListeners(form, settings);
  });
}
