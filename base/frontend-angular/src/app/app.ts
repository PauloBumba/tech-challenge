import { Component } from '@angular/core';

import { BeneficiarioLista } from './beneficiarios/beneficiario-lista';
import { PlanosLista } from './planos/planos-lista';

@Component({
  selector: 'app-root',
  imports: [PlanosLista, BeneficiarioLista],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
