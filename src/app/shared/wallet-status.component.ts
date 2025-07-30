import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from '../core/web3.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wallet-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <button *ngIf="!(address$ | async); else connected" (click)="connect()" class="px-4 py-2 bg-blue-500 text-white rounded">Connect Wallet</button>
      <ng-template #connected>
        <span class="text-sm">{{ (address$ | async) | slice:0:6 }}...{{ (address$ | async) | slice:-4 }}</span>
      </ng-template>
    </div>
  `
})
export class WalletStatusComponent implements OnInit {
  address$!: Observable<string | null>;
  constructor(private web3: Web3Service) {}
  ngOnInit() {
    this.address$ = this.web3.address$;
  }
  connect() { this.web3.connectWallet().catch(console.error); }
}
