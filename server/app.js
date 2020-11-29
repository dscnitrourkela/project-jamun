const dotenv = require('dotenv');
dotenv.config();
const express = require("express")();
const bodyParser = require('body-parser');
const { request } = require('@sendgrid/client');
const client = require('@sendgrid/client');
client.setApiKey(process.env.SENDGRID_API_KEY);

// support parsing of application/json type post data
express.use(bodyParser.json());

express.post("/addContact", async(req, res) => {
    const typeformResponse = req.body['form_response']['answers'];
    const emailField = typeformResponse.filter((each) => {
        return each.type == 'email';
    })
    const userEmail = emailField[0].email;
    await sendgrid([{
        email: userEmail
    }]);
    res.sendStatus(200);

})

const sendgrid = async(emails) => {
    try {
        const data = {
            "list_ids": [
                "917beafa-f638-44f7-be42-c6ac6e9c91ff"
            ],
            "contacts": emails
        };

        request.body = data;
        request.method = 'PUT';
        request.url = 'v3/marketing/contacts';
        client.request(request)
            .then(([response, body]) => {
                console.log(response.statusCode);
                console.log(response.body);
                console.log(new Date().toLocaleDateString());
            })
    } catch (e) {
        console.log(e.message);
    }
}

express.listen(3001, () => {
    console.log("server running at http://localhost:3001");
})