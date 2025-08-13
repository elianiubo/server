// routes/contact.js
import express from 'express';
import nodemailer from 'nodemailer';
import {formattedDate} from '../utils/helpers.js'; // Adjust the path as necessary
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

router.post('/api/contact', async (req, res) => {
    const { name, surname, email, message } = req.body;
    if (!name || !surname || !email || !message) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    console.log("USER:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransport({
        
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // your@gmail.com
            pass: process.env.EMAIL_PASS, // App password or actual SMTP password
        },
        
    });
    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `New web inquiery from ${name} ${surname} on ${formattedDate()}`,
        text: `${message}`,
    };
  
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
})
export default router;