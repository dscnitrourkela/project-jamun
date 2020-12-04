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
    const userNameField = typeformResponse.filter((each) => {
        return each.type == 'text';
    })
    const emailField = typeformResponse.filter((each) => {
        return each.type == 'email';
    })

    const firstName = userNameField[0].text;
    const lastName = userNameField[1].text;
    const userEmail = emailField[0].email;
    console.log(firstName);
    console.log(lastName);
    await sendgrid([{
        first_name: firstName,
        last_name: lastName,
        email: userEmail
    }]);
    res.sendStatus(200);

})

const sendgrid = async(contactData) => {
    try {
        const data = {
            "list_ids": [
                "47d1eb1a-6fb0-4aa7-8542-bee17d134c89"
            ],
            "contacts": contactData
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