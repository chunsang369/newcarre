const zlib = require('zlib');
const packRaw = decodeURIComponent('eJw1jcEOgjAQRP9lzxxEIwpXTTxBOJB43tCNNJa2WTBqCP9ul9bbzszbmQU8Mo5QLaDVp8YnMVSQQyaywZGCKpOsnSIjaX4qo3NjVEIc8iI5HetRkON%2Bd45Oy7oPjH0Zs2YwEXI%2FyNx7ICY5vADd19PFbWVMdg6vm30l7yY9p8Q6S%2F%2BkJdZOyXYBayj2%2BKA6Yopm1ObO6GH9AU%2BOR1M%3D');
const buf = Buffer.from(packRaw, 'base64');
const res = zlib.inflateSync(buf).toString();
console.log(JSON.parse(res));
