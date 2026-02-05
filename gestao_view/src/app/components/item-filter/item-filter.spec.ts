import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemFilter } from './item-filter';

describe('ItemFilter', () => {
  let component: ItemFilter;
  let fixture: ComponentFixture<ItemFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
