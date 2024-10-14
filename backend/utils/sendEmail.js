const nodemailer = require('nodemailer')

const sendEmail = async (subject, message, sent_from, send_to, reply_to,) => {
    //create email transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    //option for sending email

    const option = {
        from: sent_from,
        to: send_to,
        replayto: reply_to,
        subject: subject,
        html: message
    }

    //send email

    transporter.sendMail(option, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log(info)
        }
    })
};

module.exports = sendEmail;