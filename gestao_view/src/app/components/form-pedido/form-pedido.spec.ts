import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPedido } from './form-pedido';

describe('FormPedido', () => {
  let component: FormPedido;
  let fixture: ComponentFixture<FormPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPedido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPedido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
