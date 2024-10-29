const express = require('express');
const querystring = require('qs');
const crypto = require("crypto");
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment');
const {sortObject} = require('./helper')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

router.post('/create_payment_url', (req, res, next) => {
    let params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: 'ETQ61CE5',
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_ReturnUrl: 'http://localhost:3000/thankyou',
    };
    
    const currentDate = new Date();

    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    const secretKey = '7FCU5W4FMRAYVQHTRUQMM62D4TUZ7VD1';
    let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    params['vnp_IpAddr'] = ipAddr;
    params['vnp_TxnRef'] = moment(currentDate).format('DDHHmmss'); //order id
    params['vnp_OrderInfo'] = req.body.content
    params['vnp_OrderType'] = req.body.type
    params['vnp_Amount'] = req.body.amount * 100;
    params['vnp_CreateDate'] = moment(currentDate).format('YYYYMMDDHHmmss');

    params = sortObject(params);

    var signData = querystring.stringify(params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(params, { encode: false });

    res.redirect(vnpUrl)
});

app.use('/', router);

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});
