const zlib = require('zlib');
const pack = "eJw1jbEOgzAMRP/FM0MAwcDaSp2oGJA6W8QqUQOxTKoWIf69CaFb7t3LeQNGwQmaDYz+tvgigQZyyGK840QhVXWZcus02VirQiVyE9RRKeqqSqQXM0UlV+pc6cQMwZnf1u4ZLIQyjPHeZySh+OAo9CvTxR1jQrMPXw98JXaL8WfDQozrv+tIjNMBlzXsYZrxSW0SNXk09iHIsP8ACmBISw==";
const buf = Buffer.from(pack, 'base64');
const res = zlib.inflateSync(buf).toString();
console.log(res);
