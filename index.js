const express = require('express');
const querystring = require('qs');
const crypto = require("crypto");
const path = require('path');

const app = express();

const dateFormat = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const currentDate = new Date();
const expireDate = new Date(currentDate);
expireDate.setMinutes(currentDate.getMinutes() + 60);

let params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: 'ETQ61CE5',
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: dateFormat(new Date()), //system order id
    vnp_OrderInfo: 'Dinh Linh test chuyen tien',
    vnp_OrderType: 'bla bla',
    vnp_Amount: '1000000',
    vnp_ReturnUrl: 'http://localhost:3000/thankyou',
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: dateFormat(currentDate),
    vnp_ExpireDate: dateFormat(expireDate),
};

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

router.get('/create_payment_url', (req, res, next) => {
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    const secretKey = '7FCU5W4FMRAYVQHTRUQMM62D4TUZ7VD1';
    let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    params['vnp_IpAddr'] = ipAddr;
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
