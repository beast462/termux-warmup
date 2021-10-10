const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
    function spawnWorker() {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename);

            worker.on('error', reject);
            worker.on('exit', resolve);
        });
    }

    function heat(count) {
        return new Promise((resolve, reject) => {
            const promises = [];

            while (count--)
                promises.push(spawnWorker());

            Promise.all(promises).then(resolve).catch(reject);
        });
    }

    module.exports = heat;
} else {
    const crypto = require('crypto');

    for (let i = 0; i < 1000; ++i)
        crypto.createHash('sha256', crypto.randomBytes(32).toString('hex'))
            .update(crypto.randomBytes(32).toString('hex'))
            .digest();
}
