/**
 *	   Copyright (c) 2018, Gnock
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Masari Project
 *     Copyright (c) 2014-2018, MyMonero.com
 *
 *     All rights reserved.
 *     Redistribution and use in source and binary forms, with or without modification,
 *     are permitted provided that the following conditions are met:
 *
 *     ==> Redistributions of source code must retain the above copyright notice,
 *         this list of conditions and the following disclaimer.
 *     ==> Redistributions in binary form must reproduce the above copyright notice,
 *         this list of conditions and the following disclaimer in the documentation
 *         and/or other materials provided with the distribution.
 *     ==> Neither the name of Qwertycoin nor the names of its contributors
 *         may be used to endorse or promote products derived from this software
 *          without specific prior written permission.
 *
 *     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *     A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { debounce } from '../utils/helper';

export class TransactionOut {
    amount: number = 0;
    keyImage: string = '';
    outputIdx: number = 0;
    globalIndex: number = 0;

    ephemeralPub: string = '';
    pubKey: string = '';
    rtcOutPk: string = '';
    rtcMask: string = '';
    rtcAmount: string = '';

    static fromRaw(raw: any) {
        let nout = new TransactionOut();
        nout.keyImage = raw.keyImage;
        nout.outputIdx = raw.outputIdx;
        nout.globalIndex = raw.globalIndex;
        nout.amount = raw.amount;

        if (raw.ephemeralPub) nout.ephemeralPub = raw.ephemeralPub;
        if (raw.pubKey) nout.pubKey = raw.pubKey;
        if (raw.rtcOutPk) nout.rtcOutPk = raw.rtcOutPk;
        if (raw.rtcMask) nout.rtcMask = raw.rtcMask;
        if (raw.rtcAmount) nout.rtcAmount = raw.rtcAmount;

        return nout;
    }

    export() {
        // Only add properties if they have values to reduce data size
        let data: any = {
            keyImage: this.keyImage,
            outputIdx: this.outputIdx,
            globalIndex: this.globalIndex,
            amount: this.amount,
        };
        if (this.rtcOutPk) data.rtcOutPk = this.rtcOutPk;
        if (this.rtcMask) data.rtcMask = this.rtcMask;
        if (this.rtcAmount) data.rtcAmount = this.rtcAmount;
        if (this.ephemeralPub) data.ephemeralPub = this.ephemeralPub;
        if (this.pubKey) data.pubKey = this.pubKey;

        return data;
    }
}

export class TransactionIn {
    keyImage: string = '';
    amount: number = 0;

    static fromRaw(raw: any) {
        let nin = new TransactionIn();
        nin.keyImage = raw.keyImage;
        nin.amount = raw.amount;
        return nin;
    }

    export() {
        return {
            keyImage: this.keyImage,
            amount: this.amount,
        };
    }
}

export class Transaction {
    blockHeight: number = 0;
    txPubKey: string = '';
    hash: string = '';

    outs: TransactionOut[] = [];
    ins: TransactionIn[] = [];

    timestamp: number = 0;
    paymentId: string = '';
    fees: number = 0;

    is_coinbase: boolean = false;

    // Cached amount to avoid recalculating
    private cachedAmount: number | null = null;

    static fromRaw(raw: any) {
        let transac = new Transaction();
        Object.assign(transac, {
            blockHeight: raw.blockHeight,
            txPubKey: raw.txPubKey,
            timestamp: raw.timestamp,
            paymentId: raw.paymentId || '',
            fees: raw.fees || 0,
            hash: raw.hash || '',
            is_coinbase: raw.is_coinbase || false,
        });

        // Use map for concise array transformations
        transac.ins = (raw.ins || []).map(TransactionIn.fromRaw);
        transac.outs = (raw.outs || []).map(TransactionOut.fromRaw);

        return transac;
    }

    export() {
        // Only include non-default fields to optimize serialization
        let data: any = {
            blockHeight: this.blockHeight,
            txPubKey: this.txPubKey,
            timestamp: this.timestamp,
            hash: this.hash,
            is_coinbase: this.is_coinbase,
        };
        if (this.ins.length > 0) data.ins = this.ins.map(nin => nin.export());
        if (this.outs.length > 0) data.outs = this.outs.map(nout => nout.export());
        if (this.paymentId) data.paymentId = this.paymentId;
        if (this.fees) data.fees = this.fees;

        return data;
    }

    // Caching the amount for faster future calls
    getAmount() {
        if (this.cachedAmount !== null) return this.cachedAmount;

        let amount = 0;
        for (let out of this.outs) {
            amount += out.amount;
        }
        for (let nin of this.ins) {
            amount -= nin.amount;
        }
        this.cachedAmount = amount;
        return amount;
    }

    // When modifying outs or ins, reset the cached amount
    addOutput(output: TransactionOut) {
        this.outs.push(output);
        this.cachedAmount = null;
    }

    addInput(input: TransactionIn) {
        this.ins.push(input);
        this.cachedAmount = null;
    }

    isCoinbase() {
        return this.is_coinbase;
    }

    isConfirmed(blockchainHeight: number) {
        return this.isCoinbase() && this.blockHeight + config.txCoinbaseMinConfirms < blockchainHeight
            || !this.isCoinbase() && this.blockHeight + config.txMinConfirms < blockchainHeight;
    }

    isFullyChecked() {
        if (this.getAmount() === 0) return false; // Fusion transaction case
        return this.ins.every(input => input.amount >= 0);
    }
}

// Debounced function for handling large amount input
const handleLargeAmountInput = debounce((amount: number) => {
    console.log("Debounced amount processing:", amount);
    // Place additional logic here, like updating state or performing calculations
}, 300);

// Attach to the amount input field in your UI
const amountInput = document.getElementById("amountInput") as HTMLInputElement;
if (amountInput) {
    amountInput.addEventListener("input", (event: Event) => {
        const amount = parseFloat((event.target as HTMLInputElement).value);
        handleLargeAmountInput(amount);
    });
}

// Debounced function for filtering transactions
const filterTransactions = debounce((filterValue: string) => {
    console.log("Debounced filter:", filterValue);
    // Implement filtering logic for transactions here
}, 300);

// Example usage with a search input field for transactions
const transactionSearchInput = document.getElementById("transactionSearch") as HTMLInputElement;
if (transactionSearchInput) {
    transactionSearchInput.addEventListener("input", (event: Event) => {
        const filterValue = (event.target as HTMLInputElement).value;
        filterTransactions(filterValue);
    });
}
