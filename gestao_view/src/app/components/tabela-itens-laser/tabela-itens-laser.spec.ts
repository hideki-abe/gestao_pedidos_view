import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaItensLaser } from './tabela-itens-laser';

describe('TabelaItensLaser', () => {
  let component: TabelaItensLaser;
  let fixture: ComponentFixture<TabelaItensLaser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaItensLaser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaItensLaser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
