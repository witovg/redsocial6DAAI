/*-----------------
    FORM VALIDATION
-----------------*/
app.querySelector('.form', function (forms) {
    for (const form of forms) {
        const loginUsername = form.querySelector('#login-username');
        const registerEmail = form.querySelector('#register-email');

        // Identify which form it is based on the input it contains
        if (loginUsername) {
            // This is the Login Form
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                const username = loginUsername.value.trim();
                const password = form.querySelector('#login-password').value.trim();

                if (!username || !password) {
                    alert('Por favor ingrese usuario y contraseña.');
                    return;
                }

                const formData = new FormData();
                formData.append('action', 'login');
                formData.append('login_username', username);
                formData.append('login_password', password);

                fetch('auth.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => {
                        return response.text().then(text => {
                            try {
                                return JSON.parse(text);
                            } catch (e) {
                                throw new Error('El servidor devolvió algo que no es JSON: ' + text.substring(0, 100) + '...');
                            }
                        });
                    })
                    .then(data => {
                        if (data.success) {
                            window.location.href = 'hub-profile-info.html';
                        } else {
                            alert('Error del servidor: ' + (data.message || 'Error al iniciar sesión'));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Ocurrió un error técnico: ' + error.message);
                    });
            });
        } else if (registerEmail) {
            // This is the Register Form
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                const email = registerEmail.value.trim();
                const username = form.querySelector('#register-username').value.trim();
                const password = form.querySelector('#register-password').value.trim();
                const passwordRepeat = form.querySelector('#register-password-repeat').value.trim();

                let errorMessage = '';

                // Client-side validation
                if (!email) {
                    errorMessage += 'Por favor ingrese un Email.\n';
                }
                if (!username) {
                    errorMessage += 'Por favor ingrese un Nombre de Usuario.\n';
                }
                if (!password) {
                    errorMessage += 'Por favor ingrese una Contraseña.\n';
                }
                if (password !== passwordRepeat) {
                    errorMessage += 'Las Contraseñas no coinciden.\n';
                }

                if (errorMessage) {
                    alert(errorMessage);
                    return;
                }

                // If validation passes, send to server
                const formData = new FormData();
                formData.append('action', 'register');
                formData.append('register_email', email);
                formData.append('register_username', username);
                formData.append('register_password', password);

                fetch('auth.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => {
                        return response.text().then(text => {
                            try {
                                return JSON.parse(text);
                            } catch (e) {
                                throw new Error('El servidor devolvió algo que no es JSON: ' + text.substring(0, 100) + '...');
                            }
                        });
                    })
                    .then(data => {
                        if (data.success) {
                            alert('Registro exitoso. Redirigiendo...');
                            window.location.href = 'hub-profile-info.html';
                        } else {
                            alert('Error del servidor: ' + (data.message || 'Error desconocido'));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Ocurrió un error técnico: ' + error.message);
                    });
            });
        }
    }
});
