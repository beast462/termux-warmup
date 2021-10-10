const fs = require('fs');
const path = require('path');

const getCpusCount = require('./src/get-cpus-count.js');
const getTemp = require('./src/get-temp.js');
const heater = require('./src/heater.js');

const envPath = path.join(__dirname, '.env');
const defaultEnvPath = path.join(__dirname, '.default.env');

if (!fs.existsSync(envPath)) {
    if (!fs.existsSync(defaultEnvPath))
        throw new Error('Cannot find default env');

    fs.copyFileSync(defaultEnvPath, envPath);
}

require('dotenv').config({
    path: envPath,
});

let cpuCount;

getCpusCount()
    .then(count => {
        cpuCount = Math.max(count - 2, 1);
        console.log(`Found ${count} logical cores, will use ${cpuCount} for warming up`);
    })
    .catch(err => {
        console.error(err);
        process.exit(0);
    });

const config = {
    acceptableTemperature: parseFloat(process.env.acceptable_temperature),
    shellHeatConductivity: parseFloat(process.env.shell_heat_conductivity),
    phoneDiameter: parseFloat(process.env.phone_diameter) / 100,
    phoneThickness: parseFloat(process.env.phone_thickness) / 100,
    phoneWeight: parseFloat(process.env.phone_weight),
    heatCapacity: parseFloat(process.env.heat_capacity),
};

const area = (function (ratio, d) {
    const wpd = Math.cos(Math.atan(ratio));
    const width = wpd * d;
    const length = width * ratio;

    return width * length;
})(17 / 9, config.phoneDiameter);

function calculateHeatDissipationDuration(current) {
    const deltaTemp = current - config.acceptableTemperature;
    const heatDissipationEfficiency =
        ((config.shellHeatConductivity * area * deltaTemp) / 
        config.phoneThickness) - 5; // 5 for idle power consumption
    const heatQuantity = config.phoneWeight * config.heatCapacity * deltaTemp;

    return heatQuantity / heatDissipationEfficiency;
}

function checkTemp() {
    getTemp()
        .then(temp => {
            if (temp < config.acceptableTemperature) {
                console.log('Warming up');
                heater(cpuCount);
            }

            setTimeout(checkTemp, calculateHeatDissipationDuration(temp));
        })
        .catch(err => {
            console.error(err);
            process.exit(0);
        });
}

checkTemp();
