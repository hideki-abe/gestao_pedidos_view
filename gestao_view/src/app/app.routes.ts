import { Routes } from '@angular/router';
import { ProducaoComponent } from './pages/producao/producao.component';
import { Navbar } from './components/navbar/navbar';

export const routes: Routes = [
  { path: '', redirectTo: '/producao', pathMatch: 'full' },
  { path: 'producao', component: ProducaoComponent }
];
