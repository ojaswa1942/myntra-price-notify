const nodemailer = require('nodemailer');
require('dotenv').config(); //When using .env

const serviceAccounts = JSON.parse(process.env.SERVICE_ACCOUNTS); 

const sendEmailNotification = async (url, price, productName) => {
    const transporter = nodemailer.createTransport(serviceAccounts.transport);
    transporter.verify(function(error, success) {
       if (error) {
            console.log('miserable', error);
       } else {
            console.log('Server is ready to take our messages');

            let mailOptions = {
                from: serviceAccounts.from,
                to: serviceAccounts.to,
                subject: 'Cron: Myntra Notify '+productName,
                text: 'The Myntra Product '+productName+' URL: '+url+' is available at a price '+price, // plain text body
                html: 'The Myntra product <b>'+productName+'<br />URL: </b>'+url+' is available at a <b>Rs.'+price+'</b>'// html body
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            });
       }
    });
}

module.exports = {
    sendEmailNotification
}