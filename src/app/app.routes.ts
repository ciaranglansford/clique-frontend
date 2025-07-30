import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CreateComponent } from './pages/create/create.component';
import { JoinComponent } from './pages/join/join.component';
import { PotDetailsComponent } from './pages/pot-details/pot-details.component';
import { AdminComponent } from './pages/admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create', component: CreateComponent },
  { path: 'join', component: JoinComponent },
  { path: 'pot/:id', component: PotDetailsComponent },
  { path: 'admin', component: AdminComponent },
];
