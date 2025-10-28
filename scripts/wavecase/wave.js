import dict from './dict.json' with { type: 'json' };

const data = new Map(Object.entries(dict));
const decoder = makeDecoder(data);
const encoder = new Map(Object.entries(dict));
const offsetter = new Map();
const stateButton = document.getElementById("conv-state");
const submitButton = document.getElementById("conv-submit");
const form = document.getElementById("converter");
const input = document.getElementById("conv-in");
const output = document.getElementById("conv-out");
const mode = document.getElementById("conv-modetext");

function makeDecoder(dataFromJSON) {
    let decoder = new Map();
    for (let [key, value] of dataFromJSON) {
        decoder.set(value, key);
    }
    return decoder;
}

function resetDecoder() {
    for (let [k, v] of decoder) {
        if (k === ' ') {
            continue;
        }
        offsetter.set(k, v);
    }
}

function resetEncoder() {
    for (let [k, v] of encoder) {
        if (k === ' ') {
            continue;
        }
        offsetter.set(k, v);
    }
}

function offsetEncoder(arg) {
    const values = [...offsetter.values()];
    const keys = [...offsetter.keys()];
    const size = offsetter.size;
    for (let i = 0; i < size; i++) {
        offsetter.set(keys[i], values[(i + arg) % size]);
    }
}

function offsetDecoder(off) {
    const values = [...offsetter.values()];
    const keys = [...offsetter.keys()];
    const size = offsetter.size;
    for (let i = 0; i < size; i++) {
        offsetter.set(keys[i], values[(i - (off % size) + size) % size]);
    }
}

function convertToNotInsane(arg) {
    let ret = offsetter.get(arg);
    if (ret) {
        return ret;
    }
    return "";
}

function decode(arg) {
    resetDecoder();
    const valid = "^v<> ";
    let isValid = true;
    let decodingChar = "";
    let decoded = "";
    let offsetNum = 0;
    for (let c of arg) {
        if (!valid.includes(c)) {
            decoded = "invalid character detected, aborting.";
            isValid = false;
            break;
        }
        if (c === ' ') {
            decoded += convertToNotInsane(decodingChar);
            offsetNum++;
            offsetDecoder(offsetNum);
            decodingChar = "";
            decoded += c;
            continue;
        }
        if (c === '<' && decodingChar !== "") {
            decoded += convertToNotInsane(decodingChar);
            decodingChar = "";
        }
        decodingChar += c;
    }
    if (isValid) {
        decoded += convertToNotInsane(decodingChar);
    }
    return decoded;
}

function encode(arg) {
    resetEncoder();
    let encoded = "";
    let offsetNum = 0;
    for (let c of arg) {
        c = c.toLowerCase();
        let result = offsetter.get(c);
        if (c === ' ') {
            offsetNum += 1;
            offsetEncoder(offsetNum);
            encoded += c;
            continue;
        }
        if (!result) {
            continue;
        }
        encoded += result;
    }
    return encoded;
}

let encoding = true;

function convert() {
    if (encoding) {
        output.value = encode(input.value);
    } else {
        output.value = decode(input.value);
    }
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    convert();
});
stateButton.addEventListener("click", function() {
    let modeText;
    encoding = !encoding;
    if (encoding) {
        modeText = "encod";
    } else {
        modeText = "decod";
    }
    submitButton.innerText = `${modeText}e`;
    mode.innerText = `current mode: ${modeText}ing`;
});
