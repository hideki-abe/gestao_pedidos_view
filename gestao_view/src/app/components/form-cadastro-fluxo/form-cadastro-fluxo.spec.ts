import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCadastroFluxo } from './form-cadastro-fluxo';

describe('FormCadastroFluxo', () => {
  let component: FormCadastroFluxo;
  let fixture: ComponentFixture<FormCadastroFluxo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCadastroFluxo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCadastroFluxo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
