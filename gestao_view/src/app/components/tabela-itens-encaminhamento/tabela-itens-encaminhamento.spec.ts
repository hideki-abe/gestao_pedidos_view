import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaItensEncaminhamento } from './tabela-itens-encaminhamento';

describe('TabelaItensEncaminhamento', () => {
  let component: TabelaItensEncaminhamento;
  let fixture: ComponentFixture<TabelaItensEncaminhamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaItensEncaminhamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaItensEncaminhamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
