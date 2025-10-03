import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelPedidoProducao } from './painel-pedido-producao';

describe('PainelPedidoProducao', () => {
  let component: PainelPedidoProducao;
  let fixture: ComponentFixture<PainelPedidoProducao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelPedidoProducao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelPedidoProducao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
