const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let event = entry.messaging[0];
            let senderId = event.sender.id;

            if (event.message) {
                handleMessage(senderId, event.message);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

function handleMessage(senderId, receivedMessage) {
    let response;

    if (receivedMessage.text) {
        response = {
            text: `You sent the message: "${receivedMessage.text}". Now let's respond!`
        };
    } else if (receivedMessage.attachments) {
        response = {
            text: "Thanks for the attachment!"
        };
    }

    callSendAPI(senderId, response);
}

function callSendAPI(senderId, response) {
    axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: senderId },
        message: response
    })
    .then(res => console.log('Message sent!'))
    .catch(err => console.error('Unable to send message:', err));
}

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
