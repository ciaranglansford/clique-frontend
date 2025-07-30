import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-4"><h1 class="text-2xl font-bold mb-4">Clique Savings</h1>
    <p>Welcome to Clique. Create or join ETH saving pots.</p></div>`
})
export class HomeComponent {}
