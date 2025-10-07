import { Routes } from '@angular/router';
import { ProducaoComponent } from './pages/producao/producao.component';
import { EncaminhamentoComponent } from './pages/encaminhamento/encaminhamento.component';
import { CadastroComponent } from './pages/cadastro.component/cadastro.component';

export const routes: Routes = [
  { path: '', redirectTo: '/producao', pathMatch: 'full' },
  { path: 'producao', component: ProducaoComponent },
  { path: 'encaminhamento', component: EncaminhamentoComponent },
  { path: 'cadastro', component: CadastroComponent }
]
