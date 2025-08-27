import { Routes } from '@angular/router';
import { ProducaoComponent } from './pages/producao.component/producao.component';

export const routes: Routes = [
    { path: '', redirectTo: '/producao', pathMatch: 'full' },
  { path: 'producao', component: ProducaoComponent }
];
