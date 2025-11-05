import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaFinalizados } from './tabela-finalizados';

describe('TabelaFinalizados', () => {
  let component: TabelaFinalizados;
  let fixture: ComponentFixture<TabelaFinalizados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaFinalizados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaFinalizados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
