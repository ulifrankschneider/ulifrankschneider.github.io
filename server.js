require('dotenv').config(); 
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
    const { topic, securityCode, recipient, sender, language, relationship, length, context } = req.body;

    if (securityCode !== expectedCode) {
        return res.status(403).json({ error: 'Invalid or missing security code' });
    }

    if (!topic || !language) {
        return res.status(400).json({ error: 'Fields "topic" and "language" are required.' });
    }

    const senderValue = sender || 'anonymous@example.com';
    const recipientValue = recipient || 'recipient@example.com';
    const greeting = language === 'de' ? 'Viele Grüße' : 'Best regards';

    let userPrompt = language === 'de'
        ? `Schreibe eine professionelle E-Mail über: ${topic}. Die E-Mail soll an ${recipientValue} gehen und von ${senderValue} gesendet werden.`
        : `Write a professional email about: ${topic}. The email should be addressed to ${recipientValue} and sent by ${senderValue}.`;

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

        const cleanEmail = emailContent.replace(/(Best regards|Viele Grüße)[^]*$/, '').trim();
        const finalEmail = `${cleanEmail}\n\n${greeting},\n${senderValue}`;

        const subject = `Subject: ${topic}`;
        const emlContent = `From: ${senderValue}\r\nTo: ${recipientValue}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${finalEmail}\r\n\r\n${greeting},\r\n${senderValue}`;

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
