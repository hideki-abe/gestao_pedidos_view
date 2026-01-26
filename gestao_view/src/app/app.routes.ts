import { Routes } from '@angular/router';
import { ProducaoComponent } from './pages/producao/producao.component';
import { EncaminhamentoComponent } from './pages/encaminhamento/encaminhamento.component';
import { CadastroComponent } from './pages/cadastro.component/cadastro.component';
import { FinalizadosComponent } from './pages/finalizados/finalizados.component';
import { Login } from './pages/login/login';
import { CadastroUsuario } from './pages/cadastro-usuario/cadastro-usuario';
import { CadastroFluxo } from './pages/cadastro-fluxo/cadastro-fluxo';
import { RoleGuard} from './services/auth-service';
import { Laser } from './pages/laser/laser';

export const routes: Routes = [
  { path: '', redirectTo: '/producao', pathMatch: 'full' },
  { path: 'producao', component: ProducaoComponent, canActivate: [RoleGuard], data: { roles: ['admin', 'gerente', 'vendedor', 'producao', 'qualidade', 'financeiro'] } },
  { path: 'encaminhamento', component: EncaminhamentoComponent, canActivate: [RoleGuard], data: { roles: ['admin', 'gerente', 'vendedor'] } },
  { path: 'finalizados', component: FinalizadosComponent, canActivate: [RoleGuard], data: { roles: ['admin', 'gerente', 'vendedor', 'producao', 'qualidade', 'financeiro'] } },
  { path: 'cadastro', component: CadastroComponent, canActivate: [RoleGuard], data: { roles: ['admin', 'gerente'] } },
  { path: 'usuarios', component: CadastroUsuario, canActivate: [RoleGuard], data: { roles: ['admin', 'gerente'] } },
  { path: 'login', component: Login },
  { path: 'cadastro-fluxo', component: CadastroFluxo, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'laser', component: Laser, canActivate: [RoleGuard], data: { roles: ['admin', 'gerente', 'vendedor', 'producao', 'qualidade', 'financeiro'] } },
  { path: '**', redirectTo: '/login' }
];