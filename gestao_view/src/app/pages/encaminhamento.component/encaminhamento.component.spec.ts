import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncaminhamentoComponent } from './encaminhamento.component';

describe('EncaminhamentoComponent', () => {
  let component: EncaminhamentoComponent;
  let fixture: ComponentFixture<EncaminhamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncaminhamentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncaminhamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
