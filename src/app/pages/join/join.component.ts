import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Web3Service } from '../../core/web3.service';
import { interval, Subscription } from 'rxjs';
import { ethers } from 'ethers';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-bold">Available Pots</h2>
    <div *ngIf="pots.length === 0">No active pots yet.</div>
    <div *ngFor="let pot of pots" class="border p-2 flex justify-between items-center">
      <div>
        <a [routerLink]="['/pot', pot]" class="underline">{{ pot | slice:0:6 }}...{{ pot | slice:-4 }}</a>
        <span class="ml-2">{{ counts[pot] || 0 }}/{{ sizes[pot] || '-' }}</span>
      </div>
      <button class="px-2 py-1 bg-blue-500 text-white rounded" (click)="join(pot)" [disabled]="joined[pot] || full[pot]">Join</button>
    </div>
  </div>`
})
export class JoinComponent implements OnInit, OnDestroy {
  pots: string[] = [];
  counts: Record<string, number> = {};
  sizes: Record<string, number> = {};
  joined: Record<string, boolean> = {};
  full: Record<string, boolean> = {};
  sub?: Subscription;
  constructor(private web3: Web3Service) {}

  ngOnInit() {
    this.load();
    this.sub = interval(30000).subscribe(() => this.load());
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  load() {
    this.web3.getAllPots().subscribe(pots => {
      this.pots = pots;
      pots.forEach((addr: string) => {
        this.web3.getParticipants(addr).subscribe(list => this.counts[addr] = list.length);
        this.web3.maxParticipants(addr).subscribe(v => this.sizes[addr] = Number(v));
        //this.web3.getPotDetails(addr).subscribe(([full, , ]) => this.full[addr] = full);
      });
    });
  }

  join(addr: string) {
    this.web3.entryAmount(addr).subscribe(amount => {
      this.web3.joinPot(addr, amount).subscribe();
    });
  }
}
