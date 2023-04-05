"use strict";

const fetch = require('node-fetch');
const jose = require('node-jose');
const xsenv = require("@sap/xsenv");
const logger = require("../../utils/logger");

function checkStatus(response) {
    if (!response.ok) throw Error("Unexpected status code: " + response.status);
    return response;
}

async function decryptPayload(privateKey, payload) {
    const key = await jose.JWK.asKey(
        `-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`,
        "pem",
        { alg: "RSA-OAEP-256", enc: "A256GCM" }
    );
    const decrypt = await jose.JWE.createDecrypt(key).decrypt(payload);
    const result = decrypt.plaintext.toString();
    return result;
}

function headers(binding, namespace, init) {
    const result = new fetch.Headers(init);
    result.set("Authorization", `Basic ${Buffer.from(`${binding.username}:${binding.password}`).toString("base64")}`);
    result.set("sapcp-credstore-namespace", namespace);
    return result;
}

async function fetchAndDecrypt(privateKey, url, method, headers, body) {
    const result = await fetch(url, { method, headers, body })
        .then(checkStatus)
        .then(response => response.text())
        .then(payload => decryptPayload(privateKey, payload))
        .then(JSON.parse);
        logger.info("Successfully read Credentials for CredStore");
    return result;
}

async function readCredential(binding, namespace, type, name) {
    logger.info("Reading Credentials for CredStore");
    return fetchAndDecrypt(
        binding.encryption.client_private_key,
        `${binding.url}/${type}?name=${encodeURIComponent(name)}`,
        "get",
        headers(binding, namespace)
    );
}

module.exports = {
    readCredential
};

