document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const responseData = await response.text();

                if (responseData === 'Login successful') {
                    // Redirect to the profile page after successful login
                    window.location.href = '/';
                } else {
                    // Handle other success scenarios if needed
                    alert('Unexpected response after login');
                }
            } else {
                window.location.href = '/login';
                // const errorText = await response.text();
                // alert(`Login failed: ${errorText}`);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;

            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const responseData = await response.text();

                if (responseData === 'User created successfully') {
                    // alert('Sign up successful. Please login.');
                    window.location.href = '/login';
                } else {
                    // Handle other success scenarios if needed
                    alert('Unexpected response after signup');
                }
            } else {
                const errorText = await response.text();
                alert(`Sign up failed: ${errorText}`);
            }
        });
    }
});
