import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Observacao } from './observacao';

describe('Observacao', () => {
  let component: Observacao;
  let fixture: ComponentFixture<Observacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Observacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Observacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
