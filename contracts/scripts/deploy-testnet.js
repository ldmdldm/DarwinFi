"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployContracts = main;
var networks_1 = require("@injectivelabs/networks");
var sdk_ts_1 = require("@injectivelabs/sdk-ts");
var wallet_ts_1 = require("@injectivelabs/wallet-ts");
var fs_1 = require("fs");
var dotenv = require("dotenv");
var path = require("path");
// Load environment variables
dotenv.config();
// Configuration
var network = networks_1.Network.TestnetK8s;
var networkInfo = (0, networks_1.getNetworkInfo)(network);
var endpoint = process.env.TESTNET_RPC_ENDPOINT || networkInfo.rpc;
// Wallet setup
function getWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var privateKey, mnemonic, wallet, injectivePrivateKey, injectivePrivateKey;
        return __generator(this, function (_a) {
            privateKey = process.env.WALLET_PRIVATE_KEY;
            mnemonic = process.env.WALLET_MNEMONIC;
            if (!privateKey && !mnemonic) {
                throw new Error("Either WALLET_PRIVATE_KEY or WALLET_MNEMONIC must be set in environment variables");
            }
            if (privateKey) {
                injectivePrivateKey = sdk_ts_1.PrivateKey.fromHex(privateKey);
                wallet = new wallet_ts_1.PrivateKeyWallet(injectivePrivateKey);
            }
            else {
                injectivePrivateKey = sdk_ts_1.PrivateKey.fromMnemonic(mnemonic);
                wallet = new wallet_ts_1.PrivateKeyWallet(injectivePrivateKey);
            }
            return [2 /*return*/, wallet];
        });
    });
}
function deployContract(wasmFilePath, initMsg, label) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, chainGrpcWasmApi, broadcaster, wasmFile, storeCodeMsg, storeCodeTxResponse, logs, codeIdRegex, match, codeId, instantiateMsg, instantiateTxResponse, instantiateLogs, contractAddressRegex, contractMatch, contractAddress, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getWallet()];
                case 1:
                    wallet = _a.sent();
                    chainGrpcWasmApi = new sdk_ts_1.ChainGrpcWasmApi(networkInfo.grpc);
                    broadcaster = new sdk_ts_1.MsgBroadcasterWithPk({
                        network: network,
                        privateKey: wallet.privateKey
                    });
                    console.log("Deploying contract from ".concat(wasmFilePath));
                    console.log("Using wallet address: ".concat(wallet.address));
                    // 1. Upload contract code
                    console.log("Uploading contract code...");
                    wasmFile = (0, fs_1.readFileSync)(wasmFilePath);
                    storeCodeMsg = sdk_ts_1.MsgStoreCode.fromJSON({
                        sender: wallet.address,
                        wasmBytes: Buffer.from(wasmFile).toString("base64"),
                    });
                    return [4 /*yield*/, broadcaster.broadcast({
                            msgs: [storeCodeMsg],
                            memo: "Upload contract",
                        })];
                case 2:
                    storeCodeTxResponse = _a.sent();
                    logs = storeCodeTxResponse.rawLog;
                    codeIdRegex = /\"code_id\":\"(\d+)\"/;
                    match = logs.match(codeIdRegex);
                    if (!match) {
                        throw new Error("Failed to parse code ID from response: ".concat(logs));
                    }
                    codeId = match[1];
                    console.log("Contract code uploaded with code ID: ".concat(codeId));
                    // 2. Instantiate contract
                    console.log("Instantiating contract...");
                    instantiateMsg = sdk_ts_1.MsgInstantiateContract.fromJSON({
                        sender: wallet.address,
                        admin: wallet.address,
                        codeId: parseInt(codeId),
                        label: label,
                        msg: initMsg,
                    });
                    return [4 /*yield*/, broadcaster.broadcast({
                            msgs: [instantiateMsg],
                            memo: "Instantiate contract",
                        })];
                case 3:
                    instantiateTxResponse = _a.sent();
                    instantiateLogs = instantiateTxResponse.rawLog;
                    contractAddressRegex = /\"contract_address\":\"([^\"]+)\"/;
                    contractMatch = instantiateLogs.match(contractAddressRegex);
                    if (!contractMatch) {
                        throw new Error("Failed to parse contract address from response: ".concat(instantiateLogs));
                    }
                    contractAddress = contractMatch[1];
                    console.log("Contract instantiated at address: ".concat(contractAddress));
                    return [2 /*return*/, {
                            codeId: codeId,
                            contractAddress: contractAddress,
                        }];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error deploying contract:", error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var vaultContract, strategyFactoryContract, deploymentInfo, deploymentPath, frontendDeploymentPath, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log("Starting contract deployment to Injective testnet...");
                    return [4 /*yield*/, deployContract(path.resolve(__dirname, "../artifacts/vault.wasm"), {
                            name: "DarwinFi Vault",
                            symbol: "DARV",
                            decimals: 18,
                            admin: process.env.WALLET_ADDRESS
                        }, "DarwinFi Vault Contract")];
                case 1:
                    vaultContract = _a.sent();
                    return [4 /*yield*/, deployContract(path.resolve(__dirname, "../artifacts/strategy_factory.wasm"), {
                            admin: process.env.WALLET_ADDRESS,
                            vault_address: vaultContract.contractAddress
                        }, "DarwinFi Strategy Factory")];
                case 2:
                    strategyFactoryContract = _a.sent();
                    deploymentInfo = {
                        network: "testnet",
                        vaultContract: {
                            address: vaultContract.contractAddress,
                            codeId: vaultContract.codeId
                        },
                        strategyFactoryContract: {
                            address: strategyFactoryContract.contractAddress,
                            codeId: strategyFactoryContract.codeId
                        },
                        timestamp: new Date().toISOString()
                    };
                    deploymentPath = path.resolve(__dirname, "../deployed_addresses.json");
                    (0, fs_1.writeFileSync)(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
                    console.log("Deployment successful! Contract addresses saved to ".concat(deploymentPath));
                    console.log("Vault Contract: ".concat(vaultContract.contractAddress));
                    console.log("Strategy Factory Contract: ".concat(strategyFactoryContract.contractAddress));
                    frontendDeploymentPath = path.resolve(__dirname, "../frontend/src/config/addresses.json");
                    (0, fs_1.writeFileSync)(frontendDeploymentPath, JSON.stringify(deploymentInfo, null, 2));
                    console.log("Contract addresses also saved to frontend at ".concat(frontendDeploymentPath));
                    return [2 /*return*/, deploymentInfo];
                case 3:
                    error_2 = _a.sent();
                    console.error("Deployment failed:", error_2);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Execute the deployment
if (require.main === module) {
    main()
        .then(function () { return process.exit(0); })
        .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
