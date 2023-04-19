import { Component, Inject, Input, OnInit } from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from "@angular/router";
import { AppComponent } from '../app.component';
import { APIService } from '../shared/APIService';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BiometricData, Person, TargetData } from '../shared/models/UserData.model';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';

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
    private fb: FormBuilder,
    private appComponent: AppComponent,
    private apiService: APIService,
    public dialog: MatDialog
  ) { }

  public currentPerson = this.appComponent.currentPerson;
  public latestActivityDate = new Date().toDateString();

  public showCharts = false;

  //min & max Date
  public minDate: Date;
  public maxDate: Date;

  //Steps Form Builder & Form Group
  public addStepsForm = this.fb.group({
    steps: ['', [Validators.required]],
    date: ['', [Validators.required]]
  })

  getControl(name: any): AbstractControl | null {
    return this.addStepsForm.get(name)
  }

  async onSubmitStepsClick() {
    await this.addActivity();
    this.addStepsForm.reset({})
  }

  private async addActivity() {
    // Login user then send to dashboard
    await this.apiService.addActivity(this.appComponent.currentPerson.id, this.addStepsForm.get('steps').value, this.addStepsForm.get('date').value).then(async addActivityResponse => {
      await this.apiService.getAllActivity(this.appComponent.currentPerson.id).then(async activityResponse => {
        // Sort by order of date steps were done, latest to oldest
        this.appComponent.currentPerson.activities = activityResponse.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        this.currentPerson.activities = this.appComponent.currentPerson.activities;

        // Refresh charts by toggling them off and back on
        this.showCharts = false;
        setTimeout(() => {
          this.showCharts = true;
        }, 0);
      }, error => {
        console.log("error: " + error);
        // handle error here
      });
    }, error => {
      console.log("error: " + error);
      // handle error here
    });
  }

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
          filename = 'AllUserBiometricHistoryReport.csv';
          headers = ['PersonID', 'Signup Date', 'Age', 'Sex', 'Race', 'Height', 'Weight',
            'Waist Circumference', 'Neck Circumference', 'Body Fat Percentage',
            'Target Weight Loss Percentage', 'Date Biometrics Updated', 'Average Steps Per Data Entry Related To This Biometric Data'];
          response.forEach(person => {
            person.biometrics.forEach((biometricData, index) => {
              var updateDate = new Date(biometricData.dateUpdated).setHours(0, 0, 0, 0);
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
                DateBiometricsUpdated: new Date(biometricData.dateUpdated).toLocaleString(),
                AvgStepsPerDataEntryForBiometricPeriod: 0
              };
              // Check if person has any recorded activity and calculate averages as needed
              if (person.activities && person.activities.length) {
                var totalStepsInRange = 0;
                var dataEntryCount = 0;
                var nextEntryUpdateDate = new Date().setHours(0, 0, 0, 0);
                const today = new Date();
                // Viable data entry days based on how long the selected biometric data has been in use, converting from milliseconds to days
                //Check if this is the latest entry
                if (index == person.biometrics.length - 1) {
                  person.activities.forEach(dataEntry => {
                    var entryDate = new Date(dataEntry.date).setHours(0, 0, 0, 0);
                    if (entryDate >= updateDate) {
                      totalStepsInRange += dataEntry.steps;
                      dataEntryCount += 1;
                    }
                  });
                } else {
                  nextEntryUpdateDate = new Date(person.biometrics[index + 1].dateUpdated).setHours(0, 0, 0, 0);
                  person.activities.forEach(dataEntry => {
                    var entryDate = new Date(dataEntry.date).setHours(0, 0, 0, 0);
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

  public onUpdateBiometricsButtonClick() {
    const dialogRef = this.dialog.open(UpdateBiometricsDialog, {
      data: {
        personID: this.currentPerson.id,
        gender: this.currentPerson.gender,
        bodyFatPercentage: this.currentPerson.biometrics[this.currentPerson.biometrics.length - 1].bodyFatPercentage,
        height: this.currentPerson.biometrics[this.currentPerson.biometrics.length - 1].height,
        neckCircumference: this.currentPerson.biometrics[this.currentPerson.biometrics.length - 1].neckCircumference,
        waistCircumference: this.currentPerson.biometrics[this.currentPerson.biometrics.length - 1].waistCircumference,
        weight: this.currentPerson.biometrics[this.currentPerson.biometrics.length - 1].weight,
        targetWeightLossPercentage: this.currentPerson.targets[this.currentPerson.targets.length - 1].weightLossPercentage
      },
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result == true) {
        // Get updated person data
        await this.apiService.getPersonData(this.currentPerson.id).then(async getPersonResponse => {
          this.appComponent.currentPerson = getPersonResponse;
          if (getPersonResponse.activities == null) {
            this.appComponent.currentPerson.activities = [];
          } else {
            this.appComponent.currentPerson.activities = getPersonResponse.activities.sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
          }

          // Make sure local variable is also updated
          this.currentPerson = this.appComponent.currentPerson;

          // Refresh charts by toggling them off and back on
          this.showCharts = false;
          setTimeout(() => {
            this.showCharts = true;
          }, 0);

        }, error => {
          console.log("error: " + error);
          // handle error here
        });
      }
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
      this.showCharts = true;
    }

    // Set the min and max date for adding steps.
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 0, 0, 1);
    this.maxDate = new Date(currentYear + 0, 11, 31);

    // Testing site can tell if user is admin
    if (this.appComponent.userRoles.includes("ROLE_ADMIN")) {
      console.log("Admin");
      this.onLatestUserMetricsReportClick();
      this.onFullUserBiometricHistoryReportClick();
    } else{
      console.log("User");
    }
  }
}

export interface DialogData {
  personID: number;
  gender: String;
  bodyFatPercentage: number;
  height: number;
  neckCircumference: number;
  waistCircumference: number;
  weight: number;
  targetWeightLossPercentage: number;
}

@Component({
  selector: 'update-biometrics-dialog',
  templateUrl: 'update-biometrics-dialog.html',
})
export class UpdateBiometricsDialog {
  constructor(
    public dialogRef: MatDialogRef<UpdateBiometricsDialog>,
    private appComponent: AppComponent,
    private apiService: APIService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  public targetWeight = 0;
  public targetBodyFatPercentage = 0;
  public stepsPerDay = 0;
  public lbsConversionToKG = 2.2;
  public percentageConversionToKG = 0.2;

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSubmitClick(): void {
    this.calcTargetBodyFatPercentage();
    this.calcTargetWeight();
    this.calcSteps();

    this.updateBiometricsData();
  }

  private async updateBiometricsData() {
    // Target Data
    var targetData = new TargetData();
    targetData.dailySteps = this.stepsPerDay;
    targetData.weightLoss = +this.data.weight - this.targetWeight;
    targetData.weightLossPercentage = +this.data.targetWeightLossPercentage;

    // Biometric data
    var biometricData = new BiometricData();
    biometricData.bodyFatPercentage = +this.data.bodyFatPercentage;
    biometricData.height = +this.data.height;
    biometricData.neckCircumference = +this.data.neckCircumference;
    biometricData.waistCircumference = +this.data.waistCircumference;
    biometricData.weight = +this.data.weight;

    // Create new target entry
    await this.apiService.createTargetData(this.data.personID, targetData).then(async targetDataResponse => {
      // Create new biometric entry
      await this.apiService.createBiometricData(this.data.personID, biometricData).then(async biometricDataResponse => {
        // Close Dialog
        this.dialogRef.close(true);
      }, error => {
        console.log("error: " + error);
        // handle error here
      });
    }, error => {
      console.log("error: " + error);
      // handle error here
    });
  }

  public calcTargetWeight() {
    var currentWeight = +this.data.weight;
    var targetWeightLoss = (+this.data.targetWeightLossPercentage / 100) * currentWeight;
    var targetWeight = currentWeight - targetWeightLoss;
    this.targetWeight = +targetWeight.toFixed(2);
  }

  public calcTargetBodyFatPercentage() {
    var currentBodyFatPercentageDecimal = (+this.data.bodyFatPercentage / 100);
    var currentFatMass = currentBodyFatPercentageDecimal * (+this.data.weight / this.lbsConversionToKG);
    var targetWeightLossKG = (+this.data.targetWeightLossPercentage / 100) * (+this.data.weight / this.lbsConversionToKG);
    var newFatMass = currentFatMass - targetWeightLossKG;
    var targetWeightKG = (+this.data.weight / this.lbsConversionToKG) - targetWeightLossKG;
    var targetBodyFatPercentage = (newFatMass / targetWeightKG) * 100;
    this.targetBodyFatPercentage = +targetBodyFatPercentage;
  }

  public calcSteps() {
    if (this.data.gender == "Male") {
      var stepsPerKGPerDay = 39377.34 / (Math.pow(this.targetBodyFatPercentage, 1.3405));
      this.stepsPerDay = +stepsPerKGPerDay * ((+this.data.weight! / this.lbsConversionToKG) * (+this.data.bodyFatPercentage! / 100));
      this.stepsPerDay = +this.stepsPerDay.toFixed(0);
    }
    else if (this.data.gender == "Female") {
      var stepsPerKGPerDay = 261425.4 / (Math.pow(this.targetBodyFatPercentage, 1.8797));
      this.stepsPerDay = +stepsPerKGPerDay * ((+this.data.weight! / this.lbsConversionToKG) * (+this.data.bodyFatPercentage! / 100));
      this.stepsPerDay = +this.stepsPerDay.toFixed(0);
    }
  }


}
