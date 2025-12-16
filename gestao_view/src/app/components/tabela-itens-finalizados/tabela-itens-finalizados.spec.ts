import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaItens } from './tabela-itens-finalizados';

describe('TabelaItens', () => {
  let component: TabelaItens;
  let fixture: ComponentFixture<TabelaItens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaItens]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaItens);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
