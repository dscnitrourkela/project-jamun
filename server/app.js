const dotenv = require('dotenv');
dotenv.config();
const express = require("express")();
const bodyParser = require('body-parser');
const { request } = require('@sendgrid/client');
const client = require('@sendgrid/client');
const { json } = require('body-parser');
const { Webhook } = require('discord-webhook-node');

client.setApiKey(process.env.SENDGRID_API_KEY);

// support parsing of application/json type post data
express.use(bodyParser.json());

const discordHook = new Webhook('https://discord.com/api/webhooks/790893557329428481/4uAeCQNdGteSjndiGBZgNgXVOaYNfDolNEdlw78qLORsfW6njLMUXGQRzsLmo3r5rlBr');

express.post("/addContact", async(req, res) => {
    const typeformResponse = req.body['form_response']['answers'];

    // console.log(typeformResponse);
    const textField = typeformResponse.filter((each) => {
        return each.type == 'text';
    })

    // console.log(textField);
    const emailField = typeformResponse.filter((each) => {
        return each.type == 'email';
    })
    const firstName = textField[0].text;
    const lastName = textField[1].text;
    const rollNo = textField[2].text;
    const userEmail = emailField[0].email;
    
    await validateRollNo(rollNo, firstName, lastName, userEmail);

})

// validate the roll No. of NIT Rourkela students
const validateRollNo = async(rollNo, firstName, lastName, userEmail) => {

const validate = new RegExp(
    '^(1|2|3|4|5|7)[0-9][0-9]((AR|AS|BM|BT|CH|CE|CR|CS|CY|EC|EI|EE|ER|FP|HS|ID|LS|MA|ME|MN|MM|PA|PH|SM)|(ar|as|bm|bt|ch|ce|cr|cs|cy|ec|ei|ee|er|fp|hs|id|ls|ma|me|mn|mm|pa|ph|sm))[0-9]{4}$'
   );
    if (!validate.test(rollNo)) {

        discordHook.setUsername('Jamun');
        discordHook.send(`${firstName} ${lastName} has entered a wrong roll No.(${rollNo})`);
    } else {
        await sendgrid([{
        first_name: firstName,
        last_name: lastName,
        email: userEmail
    }]);
    }
}

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