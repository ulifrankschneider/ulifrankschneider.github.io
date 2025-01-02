document.getElementById('generate-email').addEventListener('click', async () => {
    const topic = document.getElementById('email-topic').value;
    const securityCode = document.getElementById('security-code').value; // Sicherheitscode vom Benutzer

    try {
    const response = await fetch('https://ulifrankschneider-github-io.onrender.com/generate-email', {
        method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, securityCode }) // Sicherheitscode wird mitgesendet
                });

                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('generated-email').value = data.email;
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.error}`);
                }
            } catch (err) {
                console.error('Error:', err);
                alert('An unexpected error occurred.');
            }
        });