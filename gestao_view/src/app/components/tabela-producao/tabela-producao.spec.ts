import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaProducao } from './tabela-producao';

describe('TabelaProducao', () => {
  let component: TabelaProducao;
  let fixture: ComponentFixture<TabelaProducao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaProducao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaProducao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
