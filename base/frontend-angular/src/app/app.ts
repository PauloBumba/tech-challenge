import { Component } from '@angular/core';

import { BeneficiarioLista } from './beneficiarios/beneficiario-lista';
import { StatusDaApi } from './nucleo/status-da-api';
import { PlanosLista } from './planos/planos-lista';

@Component({
  selector: 'app-root',
  imports: [PlanosLista, BeneficiarioLista, StatusDaApi],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
