import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Web3Service } from '../../core/web3.service';
import { ethers } from 'ethers';

@Component({
  selector: 'app-pot-details',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="p-4 space-y-4" *ngIf="address">
    <h2 class="text-xl font-bold">Pot {{ address | slice:0:6 }}...{{ address | slice:-4 }}</h2>
    <div>Participants ({{ participants.length }})</div>
    <ul class="list-disc ml-5">
      <li *ngFor="let p of participants">{{ p }}</li>
    </ul>
    <div>Status: {{ full ? 'Full' : 'Open' }}</div>
    <div>Round: {{ currentRound }}</div>
    <div>Participants: {{ currentCount }} / {{ maxParticipants }}</div>
    <div>Total ETH: {{ balance }}</div>
  </div>`
})
export class PotDetailsComponent implements OnInit, OnDestroy {
  address!: string;
  participants: string[] = [];

  full = false;
  balance = '';
  currentRound = 0;
  currentCount = 0;
  maxParticipants = 0;

  private sub?: Subscription;

  constructor(private route: ActivatedRoute, private web3: Web3Service) {}

  ngOnInit() {
    this.address = this.route.snapshot.paramMap.get('id')!;
    this.load();
    this.sub = interval(15000).subscribe(() => this.load());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  load() {
    this.web3.getParticipants(this.address)
      .subscribe(list => this.participants = list);

    this.web3.getPotDetails(this.address)
      .subscribe(details => {
        const [
          potOwner,
          entryAmt,
          maxP,
          round,
          currentCount,
          state,
          balanceWei
        ] = details;

        this.currentRound = round.toNumber();
        this.currentCount = currentCount.toNumber();
        this.maxParticipants = maxP.toNumber();

        this.full = (state === 0 && this.currentCount >= this.maxParticipants);
        this.balance = ethers.formatEther(balanceWei);
      });
  }
}
