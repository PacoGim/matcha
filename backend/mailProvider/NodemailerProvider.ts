import nodemailer from "nodemailer"

let transporter : any

function getNodemailer() {
    if (transporter == null) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_MAIL,
                pass: process.env.GMAIL_APP_PWD
            }
        })
    }
    return transporter
}

export default getNodemailer