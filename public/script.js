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
    const recipient = document.getElementById('email-recipient').value || 'recipient@example.com';
    const sender = document.getElementById('sender').value || 'anonymous@example.com';
    const language = document.getElementById('language').value || 'en';
    const recipientName = document.getElementById('recipient-name').value || 'Recipient';

    const relationship = document.getElementById('relationship').value || '';
    const length = document.getElementById('length').value || '3';
    const context = document.getElementById('context').value || '';

    if (!topic || !securityCode) {
        alert("Please fill in all required fields including the security code.");
        return;
    }

    const requestBody = {
        topic,
        securityCode,
        recipient,
        sender,
        recipientName,
        language,
        relationship,
        length,
        context
    };

    try {
        const response = await fetch('https://ulifrankschneider-github-io.onrender.com/generate-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('generated-email').value = data.email;

            document.getElementById('download-eml').addEventListener('click', () => {
                const emailContent = document.getElementById('generated-email').value;
                if (!emailContent) {
                    alert('Please generate an email first.');
                    return;
                }

                const sender = document.getElementById('sender').value || 'anonymous@example.com';
                const recipient = document.getElementById('email-recipient').value || 'recipient@example.com';

                const emlContent = `From: ${sender}\r\nTo: ${recipient}\r\nSubject: Generated Email\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${emailContent}\r\n\r\nBest regards,\r\n${sender}`;

                const blob = new Blob([emlContent], { type: 'message/rfc822' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'generated-email.eml';
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
    const recipient = document.getElementById('email-recipient').value || 'recipient@example.com';

    if (!emailContent) {
        alert("Please generate the email first.");
        return;
    }

    const mailtoLink = `mailto:${encodeURIComponent(recipient)}?subject=Generated Email&body=${encodeURIComponent(emailContent)}`;
    window.location.href = mailtoLink;
});
