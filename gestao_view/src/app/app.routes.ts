import { Routes } from '@angular/router';
import { ProducaoComponent } from './pages/producao/producao.component';
import { EncaminhamentoComponent } from './pages/encaminhamento/encaminhamento.component';
import { CadastroComponent } from './pages/cadastro.component/cadastro.component';
import { Login } from './pages/login/login';
import { CadastroUsuario } from './pages/cadastro-usuario/cadastro-usuario';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/producao', pathMatch: 'full' },
  { path: 'producao', component: ProducaoComponent, canActivate: [AuthGuard] },
  { path: 'encaminhamento', component: EncaminhamentoComponent, canActivate: [AuthGuard] },
  { path: 'cadastro', component: CadastroComponent, canActivate: [AuthGuard] },
  { path: 'cadastro-usuario', component: CadastroUsuario, canActivate: [AuthGuard] },
  { path: 'login', component: Login }
];