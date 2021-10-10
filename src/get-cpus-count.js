const cp = require('child_process');

function getCpusCount() {
    return new Promise((resolve, reject) => {
        cp.exec('cat /proc/self/status | grep Cpus_allowed_list', (err, out) => {
            if (err) return reject(err);

            const cpuList = out.trim().match(/\d+\-\d+$/)[0];
            const [start, end] = cpuList.split('-').map(i => parseInt(i));
            resolve(end - start + 1);
        });
    });
}

module.exports = getCpusCount;
