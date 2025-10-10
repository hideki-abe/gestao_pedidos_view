import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoFilter } from './pedido-filter';

describe('PedidoFilter', () => {
  let component: PedidoFilter;
  let fixture: ComponentFixture<PedidoFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
