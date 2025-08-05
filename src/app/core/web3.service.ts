import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map } from 'rxjs';
import { ethers } from 'ethers';

const FACTORY_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'; // Replace with actual address
const FACTORY_ABI = [
  'function createPot(uint256,uint256) returns (address)',
  'function getAllPots() view returns (address[])'
];
const POT_ABI = [
  'function joinPot() payable',
  'function triggerPayout()',
  'function getParticipants() view returns (address[])',
  'function entryAmount() view returns(uint256)',
  'function maxParticipants() view returns(uint256)',
  'function getPotDetails() view returns (address,uint256,uint256,uint256,uint256,uint8,uint256)',
];

@Injectable({ providedIn: 'root' })
export class Web3Service {
  private provider?: ethers.BrowserProvider;
  private signer?: ethers.JsonRpcSigner;
  public address$ = new BehaviorSubject<string | null>(null);
  public chainId$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.autoConnect();
  }

  private async autoConnect() {
    if ((window as any).ethereum && (await (window as any).ethereum.request({ method: 'eth_accounts' })).length) {
      await this.connectWallet();
    }
  }

  async connectWallet() {
    if (!(window as any).ethereum) throw new Error('MetaMask not found');

    // 👇 Updated: Add explicit chain info to avoid ENS issues on local dev
    this.provider = new ethers.BrowserProvider((window as any).ethereum, {
      name: 'localhost',
      chainId: 31337,
    });

    // 👇 Updated: Avoid getSigner().getAddress() reverse ENS lookup
    const accounts = await this.provider.send('eth_requestAccounts', []);
    // this.signer = await this.provider.getSigner(); // ❌ Triggers ENS lookup internally
    this.signer = await this.provider.getSigner(accounts[0]); // ✅ Use explicit signer address

    this.address$.next(accounts[0]);

    const network = await this.provider.getNetwork();
    this.chainId$.next(Number(network.chainId));

    // Reconnect logic
    (window as any).ethereum.on('accountsChanged', () => this.autoConnect());
    (window as any).ethereum.on('chainChanged', () => this.autoConnect());
  }

  private factoryContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, this.signer);
  }

  createPot(roundSize: number, minDeposit: ethers.BigNumberish) {
    const factory = this.factoryContract();
    return from(factory['createPot'](minDeposit, roundSize));
  }

  getAllPots() {
    const factory = this.factoryContract();
    return from(factory['getAllPots']());
  }

  potContract(addr: string) {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(addr, POT_ABI, this.signer);
  }

  joinPot(addr: string, amount: bigint) {
    const pot = this.potContract(addr);
    return from(pot['joinPot']({ value: amount }));
  }

  triggerPayout(addr: string) {
    const pot = this.potContract(addr);
    return from(pot['triggerPayout']());
  }

  getPotDetails(addr: string) {
    const pot = this.potContract(addr);
    return from(pot['getPotDetails']());
  }

  getParticipants(addr: string) {
    const pot = this.potContract(addr);
    return from(pot['getParticipants']());
  }

  entryAmount(addr: string) {
    const pot = this.potContract(addr);
    return from(pot['entryAmount']());
  }

  maxParticipants(addr: string) {
    const pot = this.potContract(addr);
    return from(pot['maxParticipants']());
  }
}
