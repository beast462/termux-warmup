const cp = require('child_process');

function getTemp() {
    return new Promise((resolve, reject) => {
        cp.exec('termux-battery-status | jq .temperature', (err, out) => {
            if (err) return reject(err);

            resolve(parseFloat(out.trim()));
        });
    });
}

module.exports = getTemp;
