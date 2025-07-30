import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Web3Service } from '../../core/web3.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-bold">Admin</h2>
    <label>Pot Address <input class="border p-1" [(ngModel)]="address"/></label>
    <button class="px-2 py-1 bg-red-500 text-white" (click)="payout()">Trigger Payout</button>
  </div>`
})
export class AdminComponent {
  address = '';
  constructor(private web3: Web3Service) {}
  payout() {
    this.web3.triggerPayout(this.address).subscribe();
  }
}
