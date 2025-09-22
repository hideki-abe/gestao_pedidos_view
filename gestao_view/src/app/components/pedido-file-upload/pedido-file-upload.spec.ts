import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoFileUpload } from './pedido-file-upload';

describe('PedidoFileUpload', () => {
  let component: PedidoFileUpload;
  let fixture: ComponentFixture<PedidoFileUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoFileUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoFileUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
