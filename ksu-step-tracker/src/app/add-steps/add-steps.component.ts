import { Component, Input } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { APIService } from '../shared/APIService';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-add-steps',
  templateUrl: './add-steps.component.html',
  styleUrls: ['./add-steps.component.css']
})
export class AddStepsComponent {
//Sidebar Menu
  subMenuState:boolean = false;
  burgerClicked(evnt){
    this.subMenuState = evnt;
    console.log("inside burgerClicked: pls. change showMenu to be:",this.subMenuState);
  }

  //Success Message
  alert:boolean = false

  //min & max Date
  minDate: Date;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: APIService,
    private appComponent: AppComponent
  ) {
    // Set the minimum to January 1st this year and December 31st this year.
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 0, 0, 1);
    this.maxDate = new Date(currentYear + 0, 11, 31);
   }

  //Steps Form Builder & Form Group
  addStepsForm = this.fb.group({
    steps: ['', [Validators.required]],
    date: ['', [Validators.required]]
  })

  getControl(name:any) : AbstractControl | null {
    return this.addStepsForm.get(name)
  }

  async onSubmit() {
    await this.addActivity();
    this.alert = true
    this.addStepsForm.reset({})
  }

  closeAlert() {
    this.alert = false
  }

  private async addActivity(){
    // Login user then send to dashboard
    await this.apiService.addActivity(this.appComponent.currentPerson.id, this.addStepsForm.get('steps').value, this.addStepsForm.get('date').value).then(async addActivityResponse => {
      await this.apiService.getAllActivity(this.appComponent.currentPerson.id).then(async activityResponse => {
        // Sort by order of date steps were done, latest to oldest
        this.appComponent.currentPerson.activity = activityResponse.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      }, error => {
        console.log("error: " + error);
            // handle error here
      });
    }, error => {
      console.log("error: " + error);
        // handle error here
    });
  }
}
