//export {};
let myGlobal : any = typeof window !== 'undefined' ? window : self;
myGlobal.config = {
	debug: false,
	nodeList: [
		"https://node.dogemone.online:52000/"],
	apiUrl: [
		"https://node.dogemone.online:52000/"
	],
	nodeUrl: "https://node.dogemone.online:52000/",
	mainnetExplorerUrl: "https://explorer.dogemone.online/",
	mainnetExplorerUrlHash: "https://explorer.dogemone.online/?hash={ID}#blockchain_transaction",
	mainnetExplorerUrlBlock: "https://explorer.dogemone.online/?hash={ID}#blockchain_block",
	testnetExplorerUrl: "http://testnet.dogemone.online/",
	testnetExplorerUrlHash: "http://testnet.dogemone.online/?hash={ID}#blockchain_transaction",
	testnetExplorerUrlBlock: "http://testnet.dogemone.online/?hash={ID}#blockchain_block",
	testnet: false,
	coinUnitPlaces: 12,
	coinDisplayUnitPlaces: 2,
	txMinConfirms: 5,
	txCoinbaseMinConfirms: 10,
	addressPrefix: 27355,
	integratedAddressPrefix: 112,
	addressPrefixTestnet: 27355,
	integratedAddressPrefixTestnet: 112,
	subAddressPrefix: 113,
	subAddressPrefixTestnet: 113,
	coinFee: new JSBigInt('100000000000'),
	dustThreshold: new JSBigInt('100000000'),//used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	defaultMixin: 3, // default value mixin
	syncBlockCount: 1000,
	coinSymbol: 'DME',
	openAliasPrefix: "dme",
	coinName: 'Dogemone',
	coinUriPrefix: 'dogemone:',
	avgBlockTime: 60,
	maxBlockNumber: 500000000,
};

let randInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
config.nodeUrl = config.nodeList[randInt];

function logDebugMsg(...data: any[]) {
  if (config.debug) {
    if (data.length > 1) {
      console.log(data[0], data.slice(1));
    } else {
      console.log(data[0]);
    }
  }
}

// log debug messages if debug is set to true
myGlobal.logDebugMsg = logDebugMsg;
