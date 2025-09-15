import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaEncaminhamento } from './tabela-encaminhamento';

describe('TabelaEncaminhamento', () => {
  let component: TabelaEncaminhamento;
  let fixture: ComponentFixture<TabelaEncaminhamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaEncaminhamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaEncaminhamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
