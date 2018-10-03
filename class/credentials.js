const fs = require('fs')

class Credentials {

    constructor(file) {
        var obj = JSON.parse(fs.readFileSync(file, 'utf8'));
        this.username = obj.username;
        this.password = obj.password;
        this.campaigns_id = obj.campaigns_id;
    }
}

module.exports = Credentials;