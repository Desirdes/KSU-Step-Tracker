import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStepsComponent } from './add-steps.component';

describe('AddStepsComponent', () => {
  let component: AddStepsComponent;
  let fixture: ComponentFixture<AddStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddStepsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
