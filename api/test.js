const nodemailer = require("nodemailer");

async function sendEmail(token) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // SMTP server for Gmail
        port: 465,
        secure: true, // Use `true` for port 465, `false` for other ports
        auth: {
            user: "suphasan.m@kkumail.com", // Your email address
            pass: "qbji nsrg mtoz skgz", // Your email password or app-specific password
        },
    });

    try {
        const info = await transporter.sendMail({
            from: 'suphasan.m@kkumail.com', // Sender address
            to: "11", // List of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // Plain text body
            html: `<b>Hello world? 3 <a href="https://www.suphasan.site/change_password/${token}">Click me</a></b>`, // HTML body
        });
        return 1;
    } catch (error) {
        return 0;
    }
}

// Call the async function
async function oo() {
    const ok = await sendEmail();
    if (await sendEmail() === 1) {
        console.log("hehe");
    } else {
        console.error("haha");
    }
}
oo();