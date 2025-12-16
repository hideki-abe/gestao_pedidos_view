import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaItensFinalizados } from './tabela-itens-finalizados';

describe('TabelaItensFinalizados', () => {
  let component: TabelaItensFinalizados;
  let fixture: ComponentFixture<TabelaItensFinalizados>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaItensFinalizados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaItensFinalizados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
