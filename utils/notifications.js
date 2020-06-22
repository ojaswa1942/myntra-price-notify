const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

require('dotenv').config(); //When using .env
const serviceAccounts = JSON.parse(process.env.SERVICE_ACCOUNTS); 

const sendEmailNotification = async (url, price, productName) => {
    const transporter = nodemailer.createTransport(serviceAccounts.transport);
    transporter.verify(function(error, success) {
       if (error) {
            console.log('Error while establishing mail server connection', error);
       } else {
            let mailOptions = {
                from: serviceAccounts.from,
                to: serviceAccounts.to,
                subject: 'Cron: Myntra Notify '+productName,
                text: 'The Myntra Product '+productName+' URL: '+url+' is available at a price '+price, // plain text body
                html: 'The Myntra product <b>'+productName+'<br />URL: </b>'+url+' is available at a <b>Rs.'+price+'</b>'// html body
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log('Error while sending email notification', error);
                }
                console.log('Message sent: %s', info.messageId);
            });
       }
    });
}

const sendWhatsappNotification = async (url, price, productName) => {
    const { whatsapp } = serviceAccounts;
    try{
        const token = await fetch(`${whatsapp.api}/login`, {
            method: 'post',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(whatsapp.login),
        }).then(res => res.json()).then(res => res.token);

        const response = await fetch(`${whatsapp.api}/send`, {
            method: 'post',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                group: whatsapp.group || "default",
                body: `The Myntra product _${productName}_ is now available at price *${price}*.\nBuy now: ${url}`
            }),
        }).then(res => res.json()).then(res => res.message || res.error);

        console.log(response);
        return response;

    }
    catch(e){
        console.log(`Error while sending whatsapp notification: ${e}`);
    }
}

module.exports = {
    sendEmailNotification,
    sendWhatsappNotification
}