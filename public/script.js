document.getElementById('generate-email').addEventListener('click', async () => {
    const topic = document.getElementById('email-topic').value;
    const securityCode = document.getElementById('security-code').value; // Sicherheitscode vom Benutzer
    const recipient = document.getElementById('recipient').value; // Adressat
    const sender = document.getElementById('sender').value; // Absender
    const language = document.getElementById('language').value; // Sprache (en/de)

    // Optional Fields
    const relationship = document.getElementById('relationship').value;  // Dropdown für Beziehung
    const length = document.getElementById('length').value;  // Slider für Länge (Range-Input)
    const context = document.getElementById('context').value;

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
        const response = await fetch('https://ulifrankschneider-github-io.onrender.com/generate-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody) // Pass all the data, including optional fields
        });

        if (response.ok) {
            const data = await response.json();
            const emailContent = data.email;

            // Show the generated email in the textarea
            document.getElementById('generated-email').value = emailContent;

            // Add functionality to download as .eml file
            document.getElementById('download-eml').addEventListener('click', () => {
                const emlContent = data.emlContent;

                // Create a Blob and trigger download
                const blob = new Blob([emlContent], { type: 'message/rfc822' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'generated-email.eml'; // Save as .eml file
                link.click(); // Trigger the download
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
