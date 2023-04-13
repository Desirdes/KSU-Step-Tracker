import { Component, Input, OnInit } from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from "@angular/router";
import { AppComponent } from '../app.component';
import { APIService } from '../shared/APIService';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit{
  constructor(
    private route: ActivatedRoute,
    private appComponent: AppComponent,
    private apiService: APIService
  ) { }

  @Input() sideNavStatus: boolean = false;

  public currentPerson = this.appComponent.currentPerson;
  public latestActivityDate = new Date().toDateString();

  public async getAllPersonDataAndExportToCSV() {
    await this.apiService.getAllPersonData().then(async response => {

      // Format of headers: UserID, Age, Sex, Race, Height, Weight, Waist Circumference, Neck Circumference, Body Fat Percentage, Target Weight Loss Percentage, Date Data Updated
      console.log("response: " + JSON.stringify(response));
      var title = '';
      var Headers = [];
      var rows = [];

    }, error => {
      console.log("error: " + error);
      // handle error here
    });
  }

  ngOnInit(): void {
    if(this.currentPerson.activity.length){
      this.latestActivityDate = new Date(this.currentPerson.activity[0].date).toDateString();
    }
  }
}
