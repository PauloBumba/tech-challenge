import { Routes } from '@angular/router';

import { BeneficiarioLista } from './beneficiarios/beneficiario-lista';
import { InicioPagina } from './inicio/inicio-pagina';
import { ObservabilidadePagina } from './observabilidade/observabilidade-pagina';
import { PlanosLista } from './planos/planos-lista';

export const rotas: Routes = [
  { path: 'inicio', component: InicioPagina },
  { path: 'beneficiarios', component: BeneficiarioLista },
  { path: 'planos', component: PlanosLista },
  { path: 'observabilidade', component: ObservabilidadePagina },
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: '**', redirectTo: 'inicio' }
];
