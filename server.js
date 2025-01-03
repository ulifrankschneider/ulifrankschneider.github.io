require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const openaiApiKey = process.env.OPENAI_API_KEY;
const expectedCode = process.env.SECURITY_CODE || "X!911";

if (!openaiApiKey) {
    console.error('Missing OpenAI API key in environment variables');
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-email', async (req, res) => {
    console.log('Incoming request body:', req.body);
    const { topic, securityCode, recipient, sender, language, relationship, length, context } = req.body;

    // Check security code
    if (securityCode !== expectedCode) {
        return res.status(403).json({ error: 'Invalid or missing security code' });
    }

    // Validate required fields
    if (!topic || !recipient || !sender || !language) {
        return res.status(400).json({ error: 'All fields (topic, recipient, sender, language) are required.' });
    }

    // Define the greeting depending on the language
    const greeting = language === 'de' ? 'Viele Grüße' : 'Best regards';

    // Define the prompt based on the optional fields
    let userPrompt = language === 'de'
        ? `Schreibe eine professionelle E-Mail über: ${topic}. Die E-Mail soll an ${recipient} gehen und von ${sender} gesendet werden. Vermeide übliche Begrüßungsformeln wie "Ich hoffe, diese E-Mail erreicht Sie wohl".`
        : `Write a professional email about: ${topic}. The email should be addressed to ${recipient} and sent by ${sender}. Avoid using typical opening phrases like "I hope this email finds you well".`;

    // Optionally include relationship, length, and context in the prompt
    if (relationship) {
        userPrompt += ` The relationship is: ${relationship}.`;
    }
    if (length) {
        userPrompt += ` The email should be ${length}.`;
    }
    if (context) {
        userPrompt += ` The context: ${context}.`;
    }

    userPrompt += ` Conclude the email with '${greeting}' and the sender's name.`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 300
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            }
        });

        let emailContent = response.data?.choices?.[0]?.message?.content?.trim();
        if (!emailContent) {
            throw new Error('Failed to extract email from OpenAI response');
        }

        // Remove typical greeting at the end if the AI included one
        const cleanEmail = emailContent.replace(/(Best regards|Viele Grüße)[^]*$/, '').trim();

        // Add the correct greeting at the end of the email
        const finalEmail = `${cleanEmail}\n\n${greeting},\n${sender}`;

        // Create the email in .eml format
        const subject = `Subject: ${topic}`;
        const emlContent = `From: ${sender}\r\nTo: ${recipient}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${finalEmail}\r\n\r\n${greeting},\r\n${sender}`;

        // Return the email content and .eml format
        res.json({ email: finalEmail, emlContent: emlContent });

    } catch (error) {
        console.error('Error generating email:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Error generating email',
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
