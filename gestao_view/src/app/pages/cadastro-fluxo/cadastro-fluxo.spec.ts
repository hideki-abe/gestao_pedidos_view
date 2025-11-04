import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroFluxo } from './cadastro-fluxo';

describe('CadastroFluxo', () => {
  let component: CadastroFluxo;
  let fixture: ComponentFixture<CadastroFluxo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroFluxo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroFluxo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
