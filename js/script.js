const toggleButtons = document.querySelectorAll('.password-toggle');

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.target;
    const field = document.getElementById(targetId);
    const isPassword = field.type === 'password';

    field.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? 'Hide' : 'Show';
  });
});

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-]{7,15}$/;
const vehiclePattern = /^[A-Za-z0-9\-\s]{3,15}$/;

function setError(element, message) {
  element.textContent = message;
}

function clearError(element) {
  element.textContent = '';
}

function validateLogin() {
  let valid = true;
  const email = document.getElementById('loginEmail');
  const password = document.getElementById('loginPassword');
  const emailError = document.getElementById('loginEmailError');
  const passwordError = document.getElementById('loginPasswordError');

  clearError(emailError);
  clearError(passwordError);

  if (!email.value.trim()) {
    setError(emailError, 'Email is required.');
    valid = false;
  } else if (!emailPattern.test(email.value.trim())) {
    setError(emailError, 'Please enter a valid email address.');
    valid = false;
  }

  if (!password.value.trim()) {
    setError(passwordError, 'Password is required.');
    valid = false;
  } else if (password.value.trim().length < 6) {
    setError(passwordError, 'Password should be at least 6 characters.');
    valid = false;
  }

  return valid;
}

function validateRegistration() {
  let valid = true;
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('registerEmail');
  const phone = document.getElementById('phoneNumber');
  const password = document.getElementById('registerPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const vehicleNumber = document.getElementById('vehicleNumber');
  const vehicleType = document.getElementById('vehicleType');
  const terms = document.getElementById('termsCheckbox');

  const fullNameError = document.getElementById('fullNameError');
  const emailError = document.getElementById('registerEmailError');
  const phoneError = document.getElementById('phoneNumberError');
  const passwordError = document.getElementById('registerPasswordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');
  const vehicleNumberError = document.getElementById('vehicleNumberError');
  const vehicleTypeError = document.getElementById('vehicleTypeError');
  const termsError = document.getElementById('termsError');

  clearError(fullNameError);
  clearError(emailError);
  clearError(phoneError);
  clearError(passwordError);
  clearError(confirmPasswordError);
  clearError(vehicleNumberError);
  clearError(vehicleTypeError);
  clearError(termsError);

  if (!fullName.value.trim()) {
    setError(fullNameError, 'Full name is required.');
    valid = false;
  }

  if (!email.value.trim()) {
    setError(emailError, 'Email is required.');
    valid = false;
  } else if (!emailPattern.test(email.value.trim())) {
    setError(emailError, 'Please enter a valid email.');
    valid = false;
  }

  if (!phone.value.trim()) {
    setError(phoneError, 'Phone number is required.');
    valid = false;
  } else if (!phonePattern.test(phone.value.trim())) {
    setError(phoneError, 'Enter a valid phone number.');
    valid = false;
  }

  if (!password.value.trim()) {
    setError(passwordError, 'Password is required.');
    valid = false;
  } else if (password.value.trim().length < 8) {
    setError(passwordError, 'Use at least 8 characters.');
    valid = false;
  }

  if (!confirmPassword.value.trim()) {
    setError(confirmPasswordError, 'Please confirm your password.');
    valid = false;
  } else if (confirmPassword.value !== password.value) {
    setError(confirmPasswordError, 'Passwords do not match.');
    valid = false;
  }

  if (!vehicleNumber.value.trim()) {
    setError(vehicleNumberError, 'Vehicle number is required.');
    valid = false;
  } else if (!vehiclePattern.test(vehicleNumber.value.trim())) {
    setError(vehicleNumberError, 'Enter a valid vehicle number.');
    valid = false;
  }

  if (!vehicleType.value) {
    setError(vehicleTypeError, 'Please select your vehicle type.');
    valid = false;
  }

  if (!terms.checked) {
    setError(termsError, 'You must agree to the terms.');
    valid = false;
  }

  return valid;
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateLogin()) {
      alert('Login successful!');
      loginForm.reset();
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateRegistration()) {
      alert('Account created successfully!');
      registerForm.reset();
    }
  });
}
