// https://www.npmjs.com/package/bitcoinjs-lib?activeTab=readme

"use strict"

var orders = {};
var currentOrder; // The current order
var checkId; // The bill to check
var justPaidBill;
var showAmount = 25;
var registered = false;
var verified = false;
var convertFrom = 'usd';

var from = 'btc';
var to = 'ltc';
var usd = {
    from: 0,
    to: 0
};
var qty = {
    from: 0,
    to: 0
}

let currentHash = 0;

var currencyIndicatorIndex = 0;

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

// //Update every 7 seconds.
// setInterval(function () {
//     updateBills();
// }, 7000);

var amountMax = 100;
var amountFiat = 0;
var btcPrice = 50000;
var dogePrice;
var ltcPrice;

// Web3
const ordinalsExplorerUrl = "https://ordinalslite.com";
const baseMempoolApiUrl = "https://litecoinspace.org/api";
const baseMempoolUrl = "https://litecoinspace.org";
const dummyUtxoValue = 3_000; // https://litecoin.info/index.php/Transaction_fees implies a dust limit of 100k, but in testing 3k was fine...
const nostrOrderEventKind = 802;
const txHexByIdCache = {};
const coin = "LTC";
const urlParams = new URLSearchParams(window.location.search);
const numberOfDummyUtxosToCreate = 2;
const wallets = [
  {
    name: "Litescribe",
    url: "https://github.com/ynohtna92/extension-ltc/releases",
  },
];

let inscriptionIdentifier = urlParams.get("number");
let collectionSlug = urlParams.get("slug");
let inscriptionNumber;
let bitcoinPrice;
let recommendedFeeRate = 1;
let sellerSignedPsbt;
let price = 0;
let network;
let payerUtxos;
let dummyUtxo;
let dummyUtxos;
let paymentUtxos;
let inscription;
let modulesInitializedPromise;
let installedWalletName;
let isWalletInstalled;
let connectAppConfig;
let connectUserSession;

let listInscriptionForSale;
let generateSalePsbt;
let submitSignedSalePsbt;
let buyInscriptionNow;
// let updatePayerAddress;
let generateDummyUtxos;
// let generatePSBTGeneratingDummyUtxos;
let btnBuyInscriptionNow;

function getDigits(value) {
    return value !== 0 ? Math.floor(Math.log10(value) + 1) : 1;
}

function toFixedTrunc(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}

function convertToFiat(amount, rate) {
    if (convertFrom === 'usd')
        return amount
    return (amount * rate)
}

bind('wallet-address', 'input', function() {
    trigger(id('wallet-address'), 'keyup');
})

bind('receiveAddress', 'keyup', function() {
    if (isValidAddress(id('receiveAddress').value)) {
        id('receiveAddress').classList.remove('border-danger');
        id('receiveAddress').classList.remove('is-invalid');
        id('receiveAddress').classList.add('border-success');
        id('receiveAddress').classList.add('is-valid');
    } else {
        id('receiveAddress').classList.remove('border-success');
        id('receiveAddress').classList.remove('is-valid');
        id('receiveAddress').classList.add('border-danger');
        id('receiveAddress').classList.add('is-invalid');
    }
})

function updateOrder(order) {
    ajaxRequest('currentOrderStatus', {order: order})
        .then(function(data) {
            id('timeline-new').classList.remove('active');
            id('timeline-pending').classList.remove('active');
            id('timeline-exchange').classList.remove('active');
            id('timeline-done').classList.remove('active');
            id('timeline-steps').classList.remove('expired');

            console.log(data)

            if (data.status == 0)
                id('timeline-new').classList.add('active');
            if (data.status == 1)
                id('timeline-pending').classList.add('active');
            if (data.status > 1 && data.status <= 4) {
                id('timeline-pending').querySelector('div span').innerHTML = 'Confirmations 1/1';
            }
            if (data.status == 2 || data.status == 3 ) {
                id('timeline-exchange').classList.add('active');
                id('order-timer').style.visibility = 'hidden';
            }
            if (data.status == 4) {
                id('order-status').innerHTML = 'Order Completed';
                id('order-timer').style.visibility = 'hidden';
            }
            if (data.status == 5 || data.status == 7) {
                id('timeline-steps').classList.add('expired');
                id('order-status').innerHTML = 'Order Expired';
                id('order-timer').querySelector('span').innerHTML = 'Expired';
                id('order-timer').style.visibility = 'visible';
                id('order-timer').classList.remove('bg-warning');
                id('order-timer').classList.add('bg-danger');
                id('expiry-help').style.display = 'block';
            }
        }).catch(function(data) {
            console.log(data)
        })
}

bind('refund-payment', 'click', function() {
    this.disabled = true;
    refundOrder(order_no, id("receiveAddress").value)
})

function refundOrder(order, address) {
    ajaxRequest('refundOrderRequest', {order: order, address: address})
        .then(function(data) {
            console.log(data)
        }).catch(function(data) {
            console.log(data)
        })
}

async function doesUtxoContainInscription(utxo) {
    const html = await fetch(
        `${ordinalsExplorerUrl}/output/${utxo.txid}:${utxo.vout}`
    ).then((response) => response.text());

    return html.match(/class=thumbnails/) !== null;
}

async function getTxHexById(txId) {
    if (!txHexByIdCache[txId]) {
        txHexByIdCache[txId] = await fetch(
            `${baseMempoolApiUrl}/tx/${txId}/hex`
        ).then((response) => response.text());
    }
  
    return txHexByIdCache[txId];
}

async function getAddressUtxos(address) {
    return await fetch(`${baseMempoolApiUrl}/address/${address}/utxo`).then(
        (response) => response.json()
    );
}

async function selectUtxos(utxos, amount, vins, vouts, recommendedFeeRate) {
    const selectedUtxos = [];
    let selectedAmount = 0;

    // Sort descending by value, and filter out dummy utxos
    utxos = utxos
        .filter((x) => x.value > dummyUtxoValue)
        .sort((a, b) => b.value - a.value);

    for (const utxo of utxos) {
        // Never spend a utxo that contains an inscription for cardinal purposes
        if (await doesUtxoContainInscription(utxo)) {
            continue;
        }
        selectedUtxos.push(utxo);
        selectedAmount += utxo.value;

        if (
            selectedAmount >=
            amount +
            dummyUtxoValue +
            calculateFee(vins + selectedUtxos.length, vouts, recommendedFeeRate)
        ) {
            break;
        }
    }

    if (selectedAmount < amount) {
        throw new Error(`Not enough cardinal spendable funds.
            Address has:  ${satToBtc(selectedAmount)} ${coin}
            Needed:          ${satToBtc(amount)} ${coin}
            
            UTXOs:
            ${utxos.map((x) => `${x.txid}:${x.vout}`).join("\n")}`);
    }

    return selectedUtxos;
}

async function generatePSBTListingInscriptionForSale(ordinalOutput, price, paymentAddress) {
    let psbt = new bitcoin.Psbt({ network });
  
    const [ordinalUtxoTxId, ordinalUtxoVout] = ordinalOutput.split(":");
    const tx = bitcoin.Transaction.fromHex(await getTxHexById(ordinalUtxoTxId));
  
    const input = {
      hash: ordinalUtxoTxId,
      index: parseInt(ordinalUtxoVout),
      nonWitnessUtxo: tx.toBuffer(),
      witnessUtxo: tx.outs[ordinalUtxoVout],
      sighashType:
        bitcoin.Transaction.SIGHASH_SINGLE |
        bitcoin.Transaction.SIGHASH_ANYONECANPAY,
    };
  
    psbt.addInput(input);
  
    psbt.addOutput({
      address: paymentAddress,
      value: price,
    });
  
    return psbt.toBase64();
}

async function generatePSBTListingInscriptionCancel(returnAddress, inscription, excludeFee = false) {
    let psbt = new bitcoin.Psbt({ network });
  
    const [ordinalUtxoTxId, ordinalUtxoVout] = inscription.split("i");
    const tx = bitcoin.Transaction.fromHex(await getTxHexById(ordinalUtxoTxId));
    const networkfee = excludeFee ? 0 : 500;
  
    const input = {
      hash: ordinalUtxoTxId,
      index: parseInt(ordinalUtxoVout),
      nonWitnessUtxo: tx.toBuffer(),
      witnessUtxo: tx.outs[ordinalUtxoVout]
    };
  
    psbt.addInput(input);
  
    // Add return address minus a network fee
    psbt.addOutput({
      address: returnAddress,
      value: tx.outs[ordinalUtxoVout].value - networkfee
    });

    if (excludeFee) {
        let totalValue = 0;

        for (const utxo of paymentUtxos) {
            const tx = bitcoin.Transaction.fromHex(await getTxHexById(utxo.txid));
            for (const output in tx.outs) {
                try {
                    tx.setWitness(parseInt(output), []);
                } catch { }
            }
    
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: tx.toBuffer(),
                // witnessUtxo: tx.outs[utxo.vout],
            });
    
            totalValue += utxo.value;
        }

        const fee = calculateFee(
            psbt.txInputs.length,
            psbt.txOutputs.length,
            await recommendedFeeRate
        );

        const changeValue = totalValue - fee;

        // Change utxo
        psbt.addOutput({
            address: returnAddress,
            value: changeValue,
        });
    }
  
    return psbt.toBase64();
}

function validateSellerPSBTAndExtractPrice(sellerSignedPsbtBase64, utxo, extract = true) {
    try {
        sellerSignedPsbt = bitcoin.Psbt.fromBase64(sellerSignedPsbtBase64, {
            network,
        });
        const sellerInput = sellerSignedPsbt.txInputs[0];
        const sellerSignedPsbtInput = `${sellerInput.hash
            .reverse()
            .toString("hex")}:${sellerInput.index}`;

        if (sellerSignedPsbtInput != utxo) {
            throw `Seller signed PSBT does not match this inscription\n\n${sellerSignedPsbtInput}\n!=\n${utxo}`;
        }

        if (
            sellerSignedPsbt.txInputs.length != 1 ||
            sellerSignedPsbt.txInputs.length != 1
        ) {
            throw `Invalid seller signed PSBT`;
        }

        if (extract) {
            try {
                sellerSignedPsbt.extractTransaction(true);
            } catch (e) {
                if (e.message == "Not finalized") {
                    throw "PSBT not signed";
                } else if (e.message != "Outputs are spending more than Inputs") {
                    throw "Invalid PSBT " + e.message || e;
                }
            }
        }

        const sellerOutput = sellerSignedPsbt.txOutputs[0];
        price = sellerOutput.value;

        return Number(price);
    } catch (e) {
        console.error(e);
    }
}

async function generatePSBTBuyingInscription(payerAddress, receiverAddress, price, paymentUtxos, dummyUtxos) {
    const psbt = new bitcoin.Psbt({ network });
    let totalValue = 0;
    let totalPaymentValue = 0;

    // Add two dummy utxos inputs
    for (var i = 0; i < 2; i++) {
        const tx = bitcoin.Transaction.fromHex(await getTxHexById(dummyUtxos[i].txid));
        for (const output in tx.outs) {
            try {
                tx.setWitness(parseInt(output), []);
            } catch { }
        }

        psbt.addInput({
            hash: dummyUtxos[i].txid,
            index: dummyUtxos[i].vout,
            nonWitnessUtxo: tx.toBuffer(),
            // witnessUtxo: tx.outs[dummyUtxo.vout],
        });
    }

    // Add dummy output
    psbt.addOutput({
        address: receiverAddress,
        value: dummyUtxos[0].value + dummyUtxos[1].value,
    });

    // Add inscription output
    psbt.addOutput({
        address: receiverAddress,
        value: sellerSignedPsbt.data.inputs[0].witnessUtxo.value,
    });

    // Add payer signed input
    psbt.addInput({
        ...sellerSignedPsbt.data.globalMap.unsignedTx.tx.ins[0],
        ...sellerSignedPsbt.data.inputs[0],
    });
    // Add payer output
    psbt.addOutput({
        ...sellerSignedPsbt.data.globalMap.unsignedTx.tx.outs[0],
    });

    // Add payment utxo inputs
    for (const utxo of paymentUtxos) {
        const tx = bitcoin.Transaction.fromHex(await getTxHexById(utxo.txid));
        for (const output in tx.outs) {
            try {
                tx.setWitness(parseInt(output), []);
            } catch { }
        }
        
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            nonWitnessUtxo: tx.toBuffer(),
            // witnessUtxo: tx.outs[utxo.vout],
        });

        totalValue += utxo.value;
        totalPaymentValue += utxo.value;
    }

    // Service fee
    var market_fee = 0;
    if (service_fee_address != undefined && service_fee_rate != undefined) {
        market_fee = Math.round(price * service_fee_rate - price)
        if (market_fee > 0) {
            psbt.addOutput({
                address: service_fee_address,
                value: market_fee,
            });
        }
    }

    // Create two new dummy utxos outputs for the next purchase
    psbt.addOutput({
        address: payerAddress,
        value: dummyUtxoValue,
    });
    psbt.addOutput({
        address: payerAddress,
        value: dummyUtxoValue,
    });

    const fee = calculateFee(
        psbt.txInputs.length,
        psbt.txOutputs.length,
        await recommendedFeeRate
    );

    const changeValue = totalValue - (dummyUtxo.value * 2) - price - market_fee - fee;

    if (changeValue < 0) {
        throw `Your wallet address doesn't have enough funds to buy this inscription.
            Price:          ${satToBtc(price)} ${coin}
            Fees:       ${satToBtc(fee + market_fee + dummyUtxoValue * 2)} ${coin}
            You have:   ${satToBtc(totalPaymentValue)} ${coin}
            Required:   ${satToBtc(totalValue - changeValue)} ${coin}
            Missing:     ${satToBtc(-changeValue)} ${coin}`;
    }

    // Change utxo
    psbt.addOutput({
        address: payerAddress,
        value: changeValue,
    });

    return psbt.toBase64();
};

async function generatePSBTGeneratingDummyUtxos(payerAddress, numberOfDummyUtxosToCreate, payerUtxos) {
    const psbt = new bitcoin.Psbt({ network });
    let totalValue = 0;

    for (const utxo of payerUtxos) {
        const tx = bitcoin.Transaction.fromHex(await getTxHexById(utxo.txid));
        for (const output in tx.outs) {
            try {
                tx.setWitness(parseInt(output), []);
            } catch { }
        }

        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            nonWitnessUtxo: tx.toBuffer(),
            // witnessUtxo: tx.outs[utxo.vout],
        });

        totalValue += utxo.value;
    }

    for (let i = 0; i < numberOfDummyUtxosToCreate; i++) {
        psbt.addOutput({
            address: payerAddress,
            value: dummyUtxoValue,
        });
    }

    const fee = calculateFee(
        psbt.txInputs.length,
        psbt.txOutputs.length,
        await recommendedFeeRate
    );

    // Change utxo
    psbt.addOutput({
        address: payerAddress,
        value: totalValue - numberOfDummyUtxosToCreate * dummyUtxoValue - fee,
    });

    return psbt.toBase64();
};

async function updatePayerAddress(payerAddress) {
    try {
        payerUtxos = await getAddressUtxos(payerAddress);
    } catch (e) {
        return console.error(e);
    }

    const potentialDummyUtxos = payerUtxos.filter(
        (utxo) => utxo.value <= dummyUtxoValue
    );
    dummyUtxo = undefined;
    dummyUtxos = [];

    for (const potentialDummyUtxo of potentialDummyUtxos) {
        if (!(await doesUtxoContainInscription(potentialDummyUtxo))) {
            if (!dummyUtxo) {
                dummyUtxo = potentialDummyUtxo;
            }
            dummyUtxos.push(potentialDummyUtxo);
        }
    }

    let minimumValueRequired;
    let vins;
    let vouts;

    if (!dummyUtxo) {
        minimumValueRequired = numberOfDummyUtxosToCreate * dummyUtxoValue;
        vins = 0;
        vouts = numberOfDummyUtxosToCreate;
    } else {
        minimumValueRequired =
            price + numberOfDummyUtxosToCreate * dummyUtxoValue;
        vins = 1;
        vouts = 2 + numberOfDummyUtxosToCreate;
    }

    try {
        paymentUtxos = await selectUtxos(
            payerUtxos,
            minimumValueRequired,
            vins,
            vouts,
            await recommendedFeeRate
        );
    } catch (e) {
        paymentUtxos = undefined;
        console.error(e);
        return alert(e);
    }
};

function calculateFee(vins, vouts, recommendedFeeRate, includeChangeOutput = true) {
    const baseTxSize = 10;
    const inSize = 180;
    const outSize = 34;

    const txSize =
        baseTxSize +
        vins * inSize +
        vouts * outSize +
        includeChangeOutput * outSize;
    const fee = txSize * recommendedFeeRate;

    return fee;
}

function btcToSat(btc) {
    return Math.floor(Number(btc) * Math.pow(10, 8));
}

function satToBtc(sat) {
    return Number(sat) / Math.pow(10, 8);
}  

function base64ToHex(str) {
    return atob(str)
        .split("")
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
}

function hexToBase64(hexstring) {
    return btoa(hexstring.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}

function getInstalledWalletName() {
    if (typeof window.litescribe !== "undefined") {
        return "Litescribe";
    }
}

/**
 * getWalletAddress(type = 'cardinal')
 * @param {undefined | 'cardinal' | 'ordinal'} type
 * @returns {string | undefined}
 */
async function getWalletAddress(type = "cardinal") {
    if (typeof window.litescribe !== "undefined") {
        return (await litescribe.requestAccounts())?.[0];
    }
}

async function signPSBTUsingWallet(psbtBase64) {
    await getWalletAddress();
  
    if (installedWalletName == "Litescribe") {
        return await litescribe.signPsbt(base64ToHex(psbtBase64));
    }
}

async function signPSBTUsingWalletAndBroadcast(psbtBase64) {
    try {
        const signedPsbtHex = await signPSBTUsingWallet(psbtBase64);
        const signedPsbt = bitcoin.Psbt.fromHex(signedPsbtHex);

        const txHex = signedPsbt.extractTransaction().toHex();
        const res = await fetch(`${baseMempoolApiUrl}/tx`, {
            method: "post",
            body: txHex,
        });
        if (res.status != 200) {
            return alert(
                `Mempool API returned ${res.status} ${res.statusText
                }\n\n${await res.text()}`
            );
        }

        const txId = await res.text();
        alert("Transaction signed and broadcasted to mempool successfully");
        window.open(`${baseMempoolUrl}/tx/${txId}`, "_blank");
        return txId;
    } catch (e) {
        console.error(e);
        alert(e?.message || e);
    }
}

function ajaxRequest(fn, form, n, value) {
    form = form || {};
    var data = toFormData(form);
    let promise = new Promise(function(params, callback) {
        fetch("/ajax/" + fn, {
            method: "POST",
            credentials: "same-origin",
            body: data
        }).then(function(request) {
            if (200 === request.status) {
                params(request.json());
            } else {
                callback({
                    code: 1,
                    msg: "API Error",
                    data: null
                });
            }
        }).catch(function() {
            callback({
                code: 1,
                msg: "API Error",
                data: null
            });
        });
    });
    return n && "function" == typeof n && promise.then(n), value && "function" == typeof value && promise.catch(value), promise;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getCurrencyName(shortName) {
    if (shortName === "LTC") {
        return "Litecoin";
    } else {
        return "Bitcoin";
    }
}

function isValidAddress(address) {
    // Ensure the address is provided.
    if (address === undefined) {
        return false;
    }

    // Ensure the address is a string.
    if (typeof address !== 'string') {
        return false;
    }

    // Quick and dirty regex pattern for validating the address
    const pattern = new RegExp(
        `^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$`,
    );

    const segwit = new RegExp(
        `^ltc1[a-zA-HJ-NP-Z0-9]{25,59}$`,
    );

    // Test the regex
    if (!pattern.test(address) && !segwit.test(address)) return false;

    return true;
}

function id(t) {
    return "string" == typeof t ? document.getElementById(t) : t
}

function addClass(e, n) {
    if (e = "string" == typeof e ? document.getElementById(e) : e) {
        let t = new RegExp("(^|\\s)" + n + "(\\s|$)");
        if (e instanceof Node) {
            if (t.test(e.className))
                return e;
            e.className = (e.className + " " + n).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
        } else if (e instanceof Object)
            for (var o in e)
                e[o]instanceof Node && !t.test(e[o].className) && (e[o].className = (e[o].className + " " + n).replace(/\s+/g, " ").replace(/(^ | $)/g, ""));
        else if (e.length)
            for (var i in e)
                e[i]instanceof Node && !t.test(e[i].className) && (e[i].className = (e[i].className + " " + n).replace(/\s+/g, " ").replace(/(^ | $)/g, ""));
        return e
    }
}

function removeClass(n, o) {
    if (n = "string" == typeof n ? document.getElementById(n) : n) {
        if (o) {
            if (n instanceof Node) {
                let t = new RegExp("(^|\\s)" + o + "(\\s|$)","g");
                t.test(n.className) && (n.className = n.className.replace(t, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, ""))
            } else if (n instanceof Object) {
                let t = new RegExp("(^|\\s)" + o + "(\\s|$)","g")
                  , e = new RegExp("(^|\\s)" + o + "(\\s|$)");
                for (var i in n)
                    n[i]instanceof Node && e.test(n[i].className) && (n[i].className = n[i].className.replace(t, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, ""))
            } else if (n.length) {
                let t = new RegExp("(^|\\s)" + o + "(\\s|$)","g")
                  , e = new RegExp("(^|\\s)" + o + "(\\s|$)");
                for (var r in n)
                    n[r]instanceof Node && e.test(n[r].className) && (n[r].className = n[r].className.replace(t, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, ""))
            }
        } else
            n.className = "";
        return n
    }
}

function toggleClass(t, e, n) {
    var o = this;
    return void 0 !== n ? 1 == n ? o.addClass(t, e) : o.remClass(t, e) : o.hasClass(t, e) ? o.remClass(t, e) : o.addClass(t, e),
    t
}

function hasClass(t, e) {
    t = "string" == typeof t ? document.getElementById(t) : t;
    let n = new RegExp("(^|\\s)" + e + "(\\s|$)","g");
    return n.test(t.className)
}

function children(t) {
    var children = [];
    for (var i = t.children.length; i--;) {
      // Skip comment nodes on IE8
      if (el.children[i].nodeType != 8)
        children.unshift(el.children[i]);
    }
}

function isChild(t, e, n) {
    if (n = n && ("string" == typeof n ? document.getElementById(n) : n),
    "string" == typeof e)
        if ("." == e.charAt(0))
            for (e = e.split(".")[1]; t; ) {
                if (o.func.hasClass(t, e))
                    return t;
                if (n && t == n)
                    return !1;
                t = t.parentNode
            }
        else
            for (; t; ) {
                if (t.tagName == e.toUpperCase())
                    return t;
                if (n && t == n)
                    return !1;
                t = t.parentNode
            }
    else
        for (; t; ) {
            if (t == e)
                return t;
            if (n && t == n)
                return !1;
            t = t.parentNode
        }
    return !1
}

function bind(t, e, n) {
    var node
    if (t = "string" == typeof t ? document.getElementById(t) : t)
        if (t instanceof Node || t == window)
            t.addEventListener ? (t.addEventListener(e, n),
            "mousewheel" == e && t.addEventListener("DOMMouseScroll", n)) : t.attachEvent && t.attachEvent("on" + e, n);
        else
            for (var o in t) {
                node = "string" == typeof t[o] ? document.getElementById(t[o]) : t[o],
                node && (node.addEventListener ? (node.addEventListener(e, n),
                "mousewheel" == e && node.addEventListener("DOMMouseScroll", n)) : node.attachEvent && node.attachEvent("on" + e, n))
            }
}

function unbind(t, e, n) {
    var node
    if (t = "string" == typeof t ? document.getElementById(t) : t)
        if (t instanceof Node || t == window)
            t.removeEventListener ? t.removeEventListener(e, n) : t.detachEvent && t.detachEvent("on" + e, n);
        else
            for (var o in t) {
                node = "string" == typeof t[o] ? document.getElementById(t[o]) : t[o],
                node.removeEventListener ? node.removeEventListener(e, n) : node.detachEvent && node.detachEvent("on" + e, n)
            }
}

function on(t, e, n, o) {
    if (t = "string" == typeof t ? document.getElementById(t) : t) {
        function i(t) {
            t = t || event;
            let e;
            (e = t.target.closest(n)) && o.call(e, t)
        }
        return bind(t, e, i),
        i
    }
}

function trigger(t, e) {
    t = "string" == typeof t ? document.getElementById(t) : t;
    if (document.createEvent) {
        var event = document.createEvent('HTMLEvents');
        event.initEvent(e, true, false);
        t.dispatchEvent(event);
    } else {
        t.fireEvent('on' + e);
    }
}

function hasClass(t, e) {
    t = "string" == typeof t ? document.getElementById(t) : t;
    let n = new RegExp("(^|\\s)" + e + "(\\s|$)","g");
    return n.test(t.className)
}

function before(t, e) {
    t = "string" == typeof t ? document.getElementById(t) : t,
    "string" == typeof e ? t.insertAdjacentHTML("beforebegin", e) : t.parentNode.insertBefore(e, t)
}

function after(t, e) {
    t = "string" == typeof t ? document.getElementById(t) : t,
    "string" == typeof e ? t.insertAdjacentHTML("afterend", e) : t.parentNode.insertBefore(e, t.nextSibling)
}

if (id('wallet_scanqr')) {
    id('wallet_scanqr').onclick = function(e) {
        e = e || event;
        e.preventDefault();
        qrscan({
            scan: function(code) {
                let parse = code.match(/(?:\w+:)?(\w+)(?:\?.*)?/i);
                if (parse == null) return;
                id('wallet-address').value = parse[1];
                id('wallet-address').focus();
                id('wallet-address').blur();
                trigger(id('wallet-address'), 'keyup');
                this.close();
            }
        });
    };
}

function countdownTimer(display) {
    var minutes, seconds;
    var ms = display.innerHTML.split(':');

    if (ms.length != 2)
        return;

    minutes = parseInt(ms[0]);
    seconds = parseInt(ms[1]);

    if (seconds > 0) {
        seconds--;
    }
    else if (seconds == 0 && minutes > 0) {
        minutes--;
        seconds = 59;
    }

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.innerHTML = minutes + ":" + seconds;
}

document.addEventListener("DOMContentLoaded", function() {

    BigNumber.config({ EXPONENTIAL_AT: 1e+9 })

    installedWalletName = getInstalledWalletName();

    function headerUpdate() {
        var offset = window.pageYOffset || document.documentElement.scrollTop
        0 < offset ? addClass("header", "top") : removeClass("header", "top")
    }
    headerUpdate(),
    window.onscroll = function() {
        headerUpdate()
    }
    on(document, 'click', '.copy[data-copy]', function(e) {
        e = e || event;
        e.preventDefault();
        let obj = this;
        copy(obj.getAttribute('data-copy'));
        addClass(obj, 'copied');
        setTimeout(function() {
            removeClass(obj, 'copied');
        }, 1000);
    })

    if (document.querySelector("#exchange-container")) {
        updateCoinPrices();
        setInterval(
            function () {
                updateCoinPrices();
            }, 10000);
    }

    if (document.querySelector("#order-container")) {
        setInterval(
            function () {
                updateOrder(order_no);
            }, 10000);
    }

    if (document.querySelector("#order-timer")) {
        let timer = document.querySelector("#order-timer").querySelector("span");
        if (timer) {
            setInterval(
                function() {
                    countdownTimer(timer);
                }, 1000);
        }
    }
})

function copy(text, container, doc) {
    let div = doc ? document.createElement("div") : document.createElement("textarea");
    let range = document.createRange();
    var opt_el = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if (container = container && opt_el ? container : document.body,
    div.style.position = "absolute",
    div.style.zIndex = "-999",
    div.style.opacity = "0",
    div.setAttribute("contenteditable", "true"),
    div.setAttribute("style", "position:absolute;opacity:0;z-index:-999;font-size:16px;left:0"),
    container.appendChild(div),
    doc ? div.innerHTML = text : div.textContent = text,
    opt_el || doc) {
        range.selectNodeContents(div);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        if (!doc) {
            div.setSelectionRange(0, 999999);
        }
    } else
        div.select();
    doc = document.execCommand("copy");
    return container.removeChild(div), doc;
}

function toFormData(data, form, fn) {
    var key = this;
    if (fn = fn || "", data instanceof HTMLFormElement) {
        return new FormData(data);
    }
    if (data instanceof FormData) {
        return data;
    }
    let result = form || new FormData;
    if (data instanceof Date) {
        result.append(fn, data.toISOString());
    } else {
        if (data instanceof Array) {
            data.forEach(function(params, data) {
                /** @type {string} */
                data = fn + "[" + data + "]";
                result = toFormData(params, result, data);
            });
        } else {
            if ("object" != typeof data || data instanceof File) {
                result.append(fn, data.toString());
            } else {
                var i;
                for (i in data) {
                    if (data.hasOwnProperty(i) && void 0 !== data[i]) {
                        /** @type {string} */
                        key = fn ? fn + "[" + i + "]" : i;
                        result = toFormData(data[i], result, key);
                    }
                }
            }
        }
    }
    return result;
}

function qrscan(t) {
    function e() {
        return this
    }
    var n, o = t.scan || function() {}
    , i = document.createElement("div"), t = document.createElement("div"), r = document.createElement("div"), a = document.createElement("video"), s = document.createElement("canvas"), l = s.getContext("2d"), c = !1, u = !0;
    function d(t, e, n) {
        l.beginPath(),
        l.moveTo(t.x, t.y),
        l.lineTo(e.x, e.y),
        l.lineWidth = 4,
        l.strokeStyle = n,
        l.stroke()
    }
    function f() {
        var t;
        a.readyState === a.HAVE_ENOUGH_DATA && (s.hidden = !1,
        s.height = a.videoHeight,
        s.width = a.videoWidth,
        s.clientWidth > window.innerWidth && c ? (removeClass(i, "maxvertical"),
        c = !1) : s.clientHeight > window.innerHeight && !c && (c = !0,
        addClass(i, "maxvertical")),
        l.drawImage(a, 0, 0, s.width, s.height),
        t = l.getImageData(0, 0, s.width, s.height),
        (t = jsQR(t.data, t.width, t.height, {
            inversionAttempts: "dontInvert"
        })) && (d(t.location.topLeftCorner, t.location.topRightCorner, "#00ff00"),
        d(t.location.topRightCorner, t.location.bottomRightCorner, "#00ff00"),
        d(t.location.bottomRightCorner, t.location.bottomLeftCorner, "#00ff00"),
        d(t.location.bottomLeftCorner, t.location.topLeftCorner, "#00ff00"),
        o.call(e, t.data))),
        u && requestAnimationFrame(f)
    }
    return i.setAttribute("class", "scan-qr-outer"),
    r.setAttribute("class", "scan-qr-loading"),
    t.setAttribute("class", "fa fa-times popup-close"),
    i.appendChild(s),
    i.appendChild(r),
    r.innerHTML = "Unable to access video stream<br>Allow access to the camera if you have one",
    i.appendChild(t),
    document.body.appendChild(i),
    e.scan = function(t) {
        return o = t,
        e
    }
    ,
    e.close = function() {
        u = !1,
        n && n.stop(),
        addClass(i, "hide"),
        setTimeout(function() {
            i.remove()
        }, 300)
    }
    ,
    t.onclick = function() {
        e.close()
    }
    ,
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment"
        }
    }).then(function(t) {
        a.srcObject = t,
        n = t.getTracks()[0],
        a.setAttribute("playsinline", !0),
        r.innerHTML = "Loading",
        a.play(),
        r.hidden = !0,
        requestAnimationFrame(f)
    }).catch(function(e) {
        console.error(e.message)
    }),
    e
}

function checkFormValidity() {
    let address = id('receiveAddress').value;

    return isValidAddress(address)
}