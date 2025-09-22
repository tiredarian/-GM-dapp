// ======== CONFIG ========
const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "GMPosted",
        "type": "event"
    },
    { "inputs": [], "name": "COOLDOWN", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "getGM", "outputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }], "name": "getLastGMs", "outputs": [{ "components": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "internalType": "struct GMContract.GM[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "lastGMTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "sendGM", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "totalGMs", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

const ZENCHAIN_PARAMS = {
    chainId: "0x20d8", // 8408 in hex
    chainName: "ZenChain Testnet",
    nativeCurrency: {
        name: "ZenChain Testnet Coin",
        symbol: "ZTC",
        decimals: 18,
    },
    rpcUrls: ["https://zenchain-testnet.api.onfinality.io/public"],
    blockExplorerUrls: [],
};

// ======== GLOBALS ========
let provider, signer, contract;

// ======== FUNCTIONS ========
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask!");
        return;
    }
    try {
        // Switch to ZenChain network if needed
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ZENCHAIN_PARAMS]
        });

        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        document.getElementById("status").innerText = `Wallet Connected: ${await signer.getAddress()}`;
        document.getElementById("sendGMBtn").disabled = false;

        loadGMs();
    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = "Failed to connect wallet.";
    }
}

async function sendGM() {
    try {
        document.getElementById("status").innerText = "Sending GM...";
        const tx = await contract.sendGM();
        await tx.wait();
        document.getElementById("status").innerText = "GM sent successfully!";
        loadGMs();
    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = `Error: ${err.message}`;
    }
}

async function loadGMs() {
    try {
        const recent = await contract.getLastGMs(10);
        const gmList = document.getElementById("gmList");
        gmList.innerHTML = "";

        recent.forEach((gm) => {
            const li = document.createElement("li");
            li.textContent = `${gm.sender} — ${new Date(Number(gm.timestamp) * 1000).toLocaleString()}`;
            gmList.appendChild(li);
        });
    } catch (err) {
        console.error("Failed to load GMs", err);
    }
}

// ======== EVENT LISTENERS ========
document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);
document.getElementById("sendGMBtn").addEventListener("click", sendGM);
