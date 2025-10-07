import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCadastroPedido } from './form-cadastro-pedido';

describe('FormCadastroPedido', () => {
  let component: FormCadastroPedido;
  let fixture: ComponentFixture<FormCadastroPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCadastroPedido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCadastroPedido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
