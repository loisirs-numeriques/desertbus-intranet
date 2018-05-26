const fs = require('fs')

class Credentials {

    constructor(file) {
        var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
        this.username = obj.username;
        this.password = obj.password;
    }
}

module.exports = Credentials;