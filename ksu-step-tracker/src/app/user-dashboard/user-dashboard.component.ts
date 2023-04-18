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
  //Sidebar Menu
  subMenuState:boolean = false;
  burgerClicked(evnt){
    this.subMenuState = evnt;
    console.log("inside burgerClicked: pls. change showMenu to be:",this.subMenuState);
  }

  constructor(
    private route: ActivatedRoute,
    private appComponent: AppComponent,
    private apiService: APIService
  ) { }

  public currentPerson = this.appComponent.currentPerson;
  public latestActivityDate = new Date().toDateString();

  public async getAllPersonDataAndExportToCSV(reportStyle) {
    await this.apiService.getAllPersonData().then(async response => {

      var filename = "";
      var headers = [];
      var rows = [];
      // Check what type of report should be generated
      switch (reportStyle) {
        // Report for latest metrics for each user
        case "latestMetricsAndAverageSteps":
          filename = 'LatestUserMetricsReport.csv';
          headers = ['PersonID', 'Signup Date', 'Age', 'Sex', 'Race', 'Latest Height', 'Latest Weight',
            'Latest Waist Circumference', 'Latest Neck Circumference', 'Latest Body Fat Percentage',
            'Latest Target Weight Loss Percentage', 'Date Biometrics Updated', 'Average Steps Per Data Entry', 'Average Steps Per Day Accross Research Period'];
          response.forEach(person => {
            var signupDate = new Date(person.signupDate);
            var rowData = {
              PersonID: person.id,
              SignupDate: signupDate.toLocaleString(),
              Age: person.age,
              Sex: person.gender,
              Race: person.demographic,
              LatestHeight: person.biometrics[person.biometrics.length - 1].height,
              LatestWeight: person.biometrics[person.biometrics.length - 1].weight,
              LatestWaistCircumference: person.biometrics[person.biometrics.length - 1].waistCircumference,
              LatestNeckCircumference: person.biometrics[person.biometrics.length - 1].neckCircumference,
              LatestBodyFatPercentage: person.biometrics[person.biometrics.length - 1].bodyFatPercentage,
              LatestTargetWeightLossPercentage: person.targets[person.targets.length - 1].weightLossPercentage,
              DateBiometricsUpdated: new Date(person.biometrics[person.biometrics.length - 1].dateUpdated).toLocaleString(),
              AvgStepsPerDataEntry: 0,
              AvgStepsPerDay: 0
            };
            // Check if person has any recorded activity and calculate averages as needed
            if (person.activities && person.activities.length) {
              var totalSteps = 0;
              person.activities.forEach(dataEntry => {
                totalSteps += dataEntry.steps;
              });

              rowData.AvgStepsPerDataEntry = +(totalSteps / person.activities.length).toFixed(0);

              const today = new Date();
              // Viable data entry days from moment of signup to today, converting from milliseconds to days
              var potentialDataEntryDays = (today.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24);
              // The study only cares about up to a year's worth of data
              const researchPeriodLengthInDays = 365;

              rowData.AvgStepsPerDay = +(totalSteps / Math.min(+potentialDataEntryDays.toFixed(0), researchPeriodLengthInDays)).toFixed(0);
            }
            rows.push(rowData);
          });
          break;
        case "allBiometricHistory":
          filename = 'LatestUserMetricsReport.csv';
          headers = ['PersonID', 'Signup Date', 'Age', 'Sex', 'Race', 'Height', 'Weight',
            'Waist Circumference', 'Neck Circumference', 'Body Fat Percentage',
            'Target Weight Loss Percentage', 'Date Biometrics Updated', 'Average Steps Per Data Entry Related To This Biometric Data'];
          response.forEach(person => {
            person.biometrics.forEach((biometricData, index) => {
              var updateDate = new Date(biometricData.dateUpdated);
              var rowData = {
                PersonID: person.id,
                SignupDate: new Date(person.signupDate).toLocaleString(),
                Age: person.age,
                Sex: person.gender,
                Race: person.demographic,
                Height: biometricData.height,
                Weight: biometricData.weight,
                WaistCircumference: biometricData.waistCircumference,
                NeckCircumference: biometricData.neckCircumference,
                BodyFatPercentage: biometricData.bodyFatPercentage,
                // Targets and biometrics arrays are made side by side so the indexes will match
                TargetWeightLossPercentage: person.targets[index].weightLossPercentage,
                DateBiometricsUpdated: updateDate.toLocaleString(),
                AvgStepsPerDataEntryForBiometricPeriod: 0
              };
              // Check if person has any recorded activity and calculate averages as needed
              if (person.activities && person.activities.length) {
                var totalStepsInRange = 0;
                var dataEntryCount = 0;
                var nextEntryUpdateDate = new Date();
                const today = new Date();
                // Viable data entry days based on how long the selected biometric data has been in use, converting from milliseconds to days
                //Check if this is the latest entry
                if (index == person.biometrics.length - 1) {
                  person.activities.forEach(dataEntry => {
                    var entryDate = new Date(dataEntry.date);
                    if (entryDate >= updateDate) {
                      totalStepsInRange += dataEntry.steps;
                      dataEntryCount += 1;
                    }
                  });
                } else {
                  nextEntryUpdateDate = new Date(person.biometrics[index + 1].dateUpdated);
                  person.activities.forEach(dataEntry => {
                    var entryDate = new Date(dataEntry.date);
                    if (updateDate <= entryDate && entryDate < nextEntryUpdateDate) {
                      totalStepsInRange += dataEntry.steps;
                      dataEntryCount += 1;
                    }
                  });
                }

                if (dataEntryCount != 0) {
                  rowData.AvgStepsPerDataEntryForBiometricPeriod = +(totalStepsInRange / dataEntryCount).toFixed(0);
                }
              }
              rows.push(rowData);
            });
          });
          break;
        default:
          break;
      }

      // Export data to a csv file report
      this.apiService.exportToCsv(filename, rows, headers);

    }, error => {
      console.log("error: " + error);
      // handle error here
    });
  }

  public onLatestUserMetricsReportClick() {
    this.getAllPersonDataAndExportToCSV("latestMetricsAndAverageSteps");
  }

  public onFullUserBiometricHistoryReportClick() {
    this.getAllPersonDataAndExportToCSV("allBiometricHistory");
  }

  ngOnInit(): void {
    if (this.currentPerson.activities && this.currentPerson.activities.length){
      this.latestActivityDate = new Date(this.currentPerson.activities[0].date).toDateString();
    }

    // Testing site can tell if user is admin
    if (this.appComponent.userRoles.includes("ROLE_ADMIN")) {
      console.log("Admin");
    } else{
      console.log("User");
    }
  }
}
