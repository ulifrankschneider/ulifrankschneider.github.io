document.getElementById('generate-email').addEventListener('click', async () => {
    const topic = document.getElementById('email-topic').value;
    const securityCode = document.getElementById('security-code').value; // Sicherheitscode vom Benutzer
    const recipient = document.getElementById('recipient').value; // Adressat
    const sender = document.getElementById('sender').value; // Absender
    const language = document.getElementById('language').value; // Sprache (en/de)

    if (!topic || !recipient || !sender || !securityCode) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch('https://ulifrankschneider-github-io.onrender.com/generate-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, securityCode, recipient, sender, language }) // Alle Daten übergeben
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

document.getElementById('send-email').addEventListener('click', () => {
    const emailContent = document.getElementById('generated-email').value;
    const recipient = document.getElementById('recipient').value;

    if (!emailContent || !recipient) {
        alert("Please generate the email and ensure a recipient is specified.");
        return;
    }

    const mailtoLink = `mailto:${encodeURIComponent(recipient)}?subject=Generated Email&body=${encodeURIComponent(emailContent)}`;
    window.location.href = mailtoLink;
});
