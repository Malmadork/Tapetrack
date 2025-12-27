document.querySelectorAll('.toggle-password-visibility').forEach(icon => {
    icon.addEventListener('click', () => {
        // Get the input data target for the clicked icon
        const inputId = icon.getAttribute('data-target');
        const input = document.getElementById(inputId);

        // Change input type
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }

        // Toggle the icon class
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
    });
  });