import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Web3Service } from '../../core/web3.service';
import { ethers, keccak256, toUtf8Bytes } from 'ethers';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, TooltipItem } from 'chart.js';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pot-details',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './pot-details.component.html',
  styleUrl: './pot-details.component.css',
})
export class PotDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private web3 = inject(Web3Service);

  address = '';
  destroyed$ = new Subject<void>();

  // Signals for reactivity
  participants = signal<string[]>([]);
  currentRound = signal(0);
  currentCount = signal(0);
  maxParticipants = signal(0);
  full = signal(false);
  balance = signal('');
  loading = signal(true);
  error = signal<string | null>(null);

  participantColors = new Map<string, string>();
  readonly colorPalette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

  chartData = signal<ChartConfiguration<'doughnut'>['data']>({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 8
    }]
  });

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'doughnut'>) => {
            const label = this.chartData().labels?.[tooltipItem.dataIndex] || '';
            return `${label}`;
          }
        }
      },
      legend: {
        display: false
      }
    }
  };

  // Reactive effect initialized in a valid DI context
  readonly updateChartEffect = effect(() => {
    const list = this.participants();
    const labels: string[] = [];
    const data: number[] = [];
    const bgColors: string[] = [];

    for (const addr of list) {
      labels.push(addr);
      data.push(1);

      if (!this.participantColors.has(addr)) {
        this.participantColors.set(addr, this.deterministicColor(addr));
      }
      bgColors.push(this.participantColors.get(addr)!);
    }

    this.chartData.set({
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors,
        hoverOffset: 8
      }]
    });
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid pot address');
      return;
    }

    this.address = id;
    this.fetchPotState();

    // Polling
    interval(15000)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.fetchPotState());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private fetchPotState(): void {
    this.loading.set(true);
    this.error.set(null);

    this.web3.getParticipants(this.address)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (list) => this.participants.set(list),
        error: () => this.error.set('Failed to load participants.')
      });

    this.web3.getPotDetails(this.address)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (details) => {
          const [, , maxP, round, currentCount, state, balanceWei] = details;
          this.maxParticipants.set(maxP);
          this.currentRound.set(round);
          this.currentCount.set(currentCount);
          this.full.set(state === 0 && currentCount >= maxP);
          this.balance.set(parseFloat(ethers.formatEther(balanceWei)).toFixed(4));
        },
        error: () => this.error.set('Failed to load pot details.'),
        complete: () => this.loading.set(false)
      });
  }

  private deterministicColor(addr: string): string {
    const hash = parseInt(keccak256(toUtf8Bytes(addr)).slice(2, 10), 16);
    return this.colorPalette[hash % this.colorPalette.length];
  }
}
