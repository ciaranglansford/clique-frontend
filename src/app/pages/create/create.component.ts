import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ethers } from "ethers";
import { Web3Service } from '../../core/web3.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-bold">Create Pot</h2>
    <label class="block">Round Size <input type="number" [(ngModel)]="roundSize" class="border p-1"/></label>
    <label class="block">Min Deposit (ETH) <input type="number" [(ngModel)]="min" class="border p-1"/></label>
    <button class="px-4 py-2 bg-green-500 text-white rounded" (click)="create()">Create</button>
  </div>`
})
export class CreateComponent {
  roundSize = 5;
  min = 0.05;
  constructor(private web3: Web3Service) {}
  create() {
    const val = BigInt(ethers.parseEther(this.min.toString()));
    this.web3.createPot(this.roundSize, val).subscribe();
  }
}
