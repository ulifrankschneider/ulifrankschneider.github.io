document.getElementById('toggle-optional-fields').addEventListener('click', () => {
    const optionalFieldsSection = document.getElementById('optional-fields');
    if (optionalFieldsSection.style.display === 'none' || optionalFieldsSection.style.display === '') {
        optionalFieldsSection.style.display = 'block';
        document.getElementById('toggle-optional-fields').textContent = 'Hide optional fields';
    } else {
        optionalFieldsSection.style.display = 'none';
        document.getElementById('toggle-optional-fields').textContent = 'Show optional fields';
    }
});

document.getElementById('generate-email').addEventListener('click', async () => {
    const topic = document.getElementById('email-topic').value;
    const securityCode = document.getElementById('security-code').value;
    const recipient = document.getElementById('recipient').value || 'recipient@example.com';
    const sender = document.getElementById('sender').value || 'anonymous@example.com';
    const language = document.getElementById('language').value || 'en';
    const recipientName = document.getElementById('recipient-name').value || 'Recipient';
    
    // Optional Fields
    const relationship = document.getElementById('relationship').value || '';
    const length = document.getElementById('length').value || '3';
    const context = document.getElementById('context').value || '';

    // Validate required fields (Including security code)
    if (!topic || !securityCode) {
        alert("Please fill in all required fields including the security code.");
        return;
    }

    // Prepare the body for the POST request
    const requestBody = {
        topic,
        securityCode,
        recipient,
        sender,
        recipientName,
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
            console.log('Server response:', data);

            // Show the generated email in the textarea
            document.getElementById('generated-email').value = data.email;

            // Add functionality to download as .eml file
            document.getElementById('download-eml').addEventListener('click', () => {
                const emailContent = document.getElementById('generated-email').value;
                if (!emailContent) {
                    alert('Please generate an email first.');
                    return;
                }

                const sender = document.getElementById('sender').value || 'anonymous@example.com';
                const recipient = document.getElementById('recipient').value || 'recipient@example.com';

                const emlContent = `
                    Subject: Generated Email
                    From: ${sender}
                    To: ${recipient}
                    
                    ${emailContent}
                `;

                // Create a Blob and trigger download
                const blob = new Blob([emlContent], { type: 'message/rfc822' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'generated-email.eml'; // Save as .eml file
                link.click();
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
    const recipient = document.getElementById('recipient').value || 'recipient@example.com'; // Default-Wert für Empfänger

    if (!emailContent) {
        alert("Please generate the email first.");
        return;
    }

    const mailtoLink = `mailto:${encodeURIComponent(recipient)}?subject=Generated Email&body=${encodeURIComponent(emailContent)}`;
    window.location.href = mailtoLink;
});
