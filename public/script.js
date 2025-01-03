document.getElementById('generate-email').addEventListener('click', async () => {
    const topic = document.getElementById('email-topic').value;
    const securityCode = document.getElementById('security-code').value; // Sicherheitscode vom Benutzer
    const recipient = document.getElementById('recipient').value; // Adressat
    const sender = document.getElementById('sender').value; // Absender
    const language = document.getElementById('language').value; // Sprache (en/de)

    // Optional Fields
    const relationship = document.getElementById('relationship').value;  // Dropdown für Beziehung
    const length = document.getElementById('length').value;  // Slider für Länge (Range-Input)
    const context = document.getElementById('context').value; // Optionales Kontextfeld

    // Validate required fields
    if (!topic || !recipient || !sender || !securityCode) {
        alert("Please fill in all required fields.");
        return;
    }

    // Prepare the body for the POST request
    const requestBody = {
        topic,
        securityCode,
        recipient,
        sender,
        language,
        relationship,  // Optional field (from dropdown)
        length,        // Optional field (from slider)
        context        // Optional field
    };

    try {
        // Send the POST request with the data
        const response = await fetch('https://yourserver.com/generate-email', { // Ersetze dies mit deinem Server-Endpunkt
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody) // Alle Daten, einschließlich der optionalen Felder, werden gesendet
        });

        if (response.ok) {
            const data = await response.json();
            const emailContent = data.email;

            // Zeige die generierte E-Mail im Textbereich an
            document.getElementById('generated-email').value = emailContent;

            // Funktionalität für den Download der E-Mail im .eml-Format hinzufügen
            document.getElementById('download-eml').addEventListener('click', () => {
                const emlContent = data.emlContent;

                // Blob erstellen und den Download auslösen
                const blob = new Blob([emlContent], { type: 'message/rfc822' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'generated-email.eml'; // Speichern als .eml-Datei
                link.click(); // Download auslösen
            });

        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An unexpected error occurred.');
    }
});

// Event listener für den Senden-Button (E-Mail über "mailto" öffnen)
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

// Slider: Update the length display when the slider value changes
document.getElementById('length').addEventListener('input', function() {
    const lengthValue = document.getElementById('length').value;
    const lengthText = lengthValue === "1" ? "Very Brief" :
                       lengthValue === "2" ? "Brief" :
                       lengthValue === "3" ? "Medium" :
                       lengthValue === "4" ? "Detailed" : "Very Detailed";
    document.getElementById('length-value').textContent = lengthText;
});
