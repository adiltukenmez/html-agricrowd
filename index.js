import { ethers } from "./ethers-5.7.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const createProjectButton = document.getElementById("createProjectButton");
const withdrawFundsButton = document.getElementById("withdrawFundsButton");
const donateProjectButton = document.getElementById("donateProjectButton");
const getProjectDetailsButton = document.getElementById(
    "getProjectDetailsButton",
);
const getInvesteeProjectsButton = document.getElementById(
    "getInvesteeProjectsButton",
);
const totalCommissionAmount = document.getElementById("totalCommissionAmount");

connectButton.onclick = connect;
fundButton.onclick = fund;
createProjectButton.onclick = createProject;
withdrawFundsButton.onclick = withdrawFunds;
donateProjectButton.onclick = donateProject;
getProjectDetailsButton.onclick = getProjectDetails;
getInvesteeProjectsButton.onclick = getInvesteeProjects;
getTotalCommissionButton.onclick = getTotalCommission;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(accounts);
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}

async function createProject() {
    console.log("Creating project...");
    const fundingGoalETH = document.getElementById("fundingGoalETH").value;
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.createProject(
                ethers.utils.parseEther(fundingGoalETH),
            );
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Project created!");
        } catch (error) {
            console.log(error);
        }
    }
}

async function withdrawFunds() {
    const projectId = document.getElementById("projectIdWithdraw").value;
    console.log(`Withdrawing funds for project ${projectId}...`);
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdrawFunds(projectId);
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Withdrawn funds successfully!");
        } catch (error) {
            console.log(error);
        }
    }
}

async function fund() {
    const projectId = document.getElementById("projectIdFund").value;
    console.log("Funding project...");
    const ethAmount = document.getElementById("ethAmount").value;
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fundProject(projectId, {
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Funded project successfully!");
        } catch (error) {
            console.log(error);
        }
    }
}

async function donateProject() {
    const projectId = document.getElementById("projectIdDonate").value;
    console.log("Donating project...");
    const ethAmount = document.getElementById("ethAmountDonate").value;
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.donateProject(
                projectId,
                {
                    value: ethers.utils.parseEther(ethAmount),
                },
            );
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Donated project successfully!");
        } catch (error) {
            console.log(error);
        }
    }
}

async function getProjectDetails() {
    const projectId = document.getElementById("projectIdDetails").value;
    console.log(`Getting details for project ${projectId}...`);
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        try {
            const details = await contract.getProjectDetails(projectId);
            displayProjectDetails(details);
            console.log("Retrieved project details successfully!");
        } catch (error) {
            console.log(error);
        }
    }
}

function displayProjectDetails(details) {
    const projectDetailsDiv = document.getElementById("projectDetails");
    projectDetailsDiv.innerHTML = `
        <p><strong>Investee:</strong> ${details[0]}</p>
        <p><strong>Funding Goal (USD):</strong> ${details[1]}</p>
        <p><strong>Amount Funded (USD):</strong> ${details[2]}</p>
        <p><strong>Funding Goal (ETH):</strong> ${details[3]}</p>
        <p><strong>Amount Funded (ETH):</strong> ${details[4]}</p>
        <p><strong>Amount Donated (USD):</strong> ${details[5]}</p>
        <p><strong>Amount Donated (ETH):</strong> ${details[6]}</p>
    `;
}

async function getInvesteeProjects() {
    const investeeAddress = document.getElementById("investeeAddress").value;
    console.log(`Getting projects for investee ${investeeAddress}...`);
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        try {
            const projectIds =
                await contract.getInvesteeProjects(investeeAddress);
            displayInvesteeProjects(projectIds);
            console.log("Retrieved investee projects successfully!");
        } catch (error) {
            console.log(error);
        }
    }
}

function displayInvesteeProjects(projectIds) {
    const investeeProjectsDiv = document.getElementById("investeeProjects");
    investeeProjectsDiv.innerHTML = `
        <h3>Projects of Investee:</h3>
        <ul>
            ${projectIds.map((id) => `<li>Project ID: ${id}</li>`).join("")}
        </ul>
    `;
}

async function getTotalCommission() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
        const totalCommission = await contract.getTotalCommissionAmount();
        totalCommissionAmount.textContent = `Total Commission: ${ethers.utils.formatEther(totalCommission)} ETH`;
    } catch (error) {
        console.error(error);
    }
}

async function listenForTransactionMine(transactionResponse, provider) {
    const receipt = await transactionResponse.wait();
    if (receipt.status === 1) {
        console.log("Transaction successful!");
    } else {
        console.log("Transaction failed!");
    }
}
