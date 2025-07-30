import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WalletStatusComponent } from './shared/wallet-status.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, WalletStatusComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'clique-frontend';
}
