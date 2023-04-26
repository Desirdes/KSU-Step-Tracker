import { AfterViewInit, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from "@angular/router";
import { AppComponent } from '../app.component';
import { APIService } from '../shared/APIService';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BiometricData, Person, TargetData } from '../shared/models/UserData.model';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';

// Admin report table interfaces
export interface LatestDataRow {
  PersonID: number;
  Username: string;
  Email: string;
  SignupDate: string;
  Age: number;
  Sex: string;
  Race: string;
  LatestHeight: number;
  LatestWeight: number;
  LatestWaistCircumference: number;
  LatestNeckCircumference: number;
  LatestBodyFatPercentage: number;
  LatestTargetWeightLossPercentage: number;
  DateBiometricsUpdated: string;
  AvgStepsPerDataEntry: number;
  AvgStepsPerDay: number;
}

export interface FullDataRow {
  PersonID: number;
  Username: string;
  Email: string;
  SignupDate: string;
  Age: number;
  Sex: string;
  Race: string;
  Height: number;
  Weight: number;
  WaistCircumference: number;
  NeckCircumference: number;
  BodyFatPercentage: number;
  TargetWeightLossPercentage: number;
  DateBiometricsUpdated: string;
  AvgStepsPerDataEntryForBiometricPeriod: number;
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private appComponent: AppComponent,
    private apiService: APIService,
    public dialog: MatDialog
  ) { }

  @ViewChild('latestPaginator') latestPaginator: MatPaginator;
  @ViewChild('fullPaginator') fullPaginator: MatPaginator;

  public applyFilterForLatest(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceLatestData.filter = filterValue.trim().toLowerCase();
  }

  public applyFilterForFull(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceFullData.filter = filterValue.trim().toLowerCase();
  }

  public currentPerson = this.appComponent.currentPerson;
  public latestActivityDate = new Date().toDateString();

  public personDataList = null;
  public selectedUserForPasswordReset = null;

  public showCharts = false;

  public showAdmin = false;

  //min & max Date for viable research data
  public minDate: Date;
  public maxDate: Date;

  public displayedColumnsLatestData = ['PersonID', 'Username', 'Email', 'SignupDate', 'Age', 'Sex', 'Race', 'LatestHeight', 'LatestWeight',
    'LatestWaistCircumference', 'LatestNeckCircumference', 'LatestBodyFatPercentage',
    'LatestTargetWeightLossPercentage', 'DateBiometricsUpdated', 'AvgStepsPerDataEntry', 'AvgStepsPerDay'];
  public dataSourceLatestData = new MatTableDataSource<LatestDataRow>();

  public displayedColumnsFullData = ['PersonID', 'Username', 'Email', 'SignupDate', 'Age', 'Sex', 'Race', 'Height', 'Weight',
    'WaistCircumference', 'NeckCircumference', 'BodyFatPercentage',
    'TargetWeightLossPercentage', 'DateBiometricsUpdated', 'AvgStepsPerDataEntryForBiometricPeriod', 'ActivityDate', 'ActivitySteps'];
  public dataSourceFullData = new MatTableDataSource<FullDataRow>();

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

  public async getAllPersonDataForTables() {
    await this.apiService.getAllPersonData().then(async response => {
      this.personDataList = response;

      response.forEach(person => {
        //check that person has biometrics on record, if not then the user is incomplete and will not be displayed
        if (person.biometrics && person.biometrics.length) {
          var signupDate = new Date(person.signupDate);

          // Latest data
          var latestData = {
            PersonID: person.id,
            Username: person.username,
            Email: person.email,
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

            latestData.AvgStepsPerDataEntry = +(totalSteps / person.activities.length).toFixed(0);

            const today = new Date();
            // Viable data entry days from moment of signup to today, converting from milliseconds to days
            var potentialDataEntryDays = (new Date(today.setHours(0, 0, 0, 0)).getTime() - new Date(signupDate.setHours(0, 0, 0, 0)).getTime()) / (1000 * 60 * 60 * 24);
            // The study only cares about up to a year's worth of data
            const researchPeriodLengthInDays = 365;

            if (new Date(today.setHours(0, 0, 0, 0)).getTime() == new Date(signupDate.setHours(0, 0, 0, 0)).getTime()) {
              latestData.AvgStepsPerDay = totalSteps;
            } else {
              latestData.AvgStepsPerDay = +(totalSteps / Math.min(+potentialDataEntryDays.toFixed(0), researchPeriodLengthInDays)).toFixed(0);
            }
          }
          this.dataSourceLatestData.data.push(latestData);


          // Full data
          if (person.activities && person.activities.length) {
            var activitiesArray = person.activities.sort((a, b) => {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
            person.biometrics.forEach((biometricData, index) => {
              var biometricHasViableActivity = false;
              activitiesArray.forEach(dataEntry => {
                var updateDate = new Date(biometricData.dateUpdated);
                var fullData = {
                  PersonID: person.id,
                  Username: person.username,
                  Email: person.email,
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
                  AvgStepsPerDataEntryForBiometricPeriod: 0,
                  ActivityDate: new Date(dataEntry.date).toLocaleString(),
                  ActivitySteps: dataEntry.steps
                };
              
                // Calculate averages as needed
                var totalStepsInRange = 0;
                var dataEntryCount = 0;
                var nextEntryUpdateDate = new Date();
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
                  person.activities.forEach(dataEntryForAverageCalculation => {
                    var entryDate = new Date(dataEntryForAverageCalculation.date);
                    if (updateDate <= entryDate && entryDate < nextEntryUpdateDate) {
                      totalStepsInRange += dataEntryForAverageCalculation.steps;
                      dataEntryCount += 1;
                    }
                  });
                }

                if (dataEntryCount != 0) {
                  fullData.AvgStepsPerDataEntryForBiometricPeriod = +(totalStepsInRange / dataEntryCount).toFixed(0);
                }
                // Viable data entry days based on how long the selected biometric data has been in use, converting from milliseconds to days
                //Check if this is the latest entry
                if (index == person.biometrics.length - 1) {
                  var entryDate = new Date(new Date(dataEntry.date).setHours(0,0,0,0));
                  if (entryDate >= new Date(new Date(updateDate).setHours(0, 0, 0, 0))) {
                    biometricHasViableActivity = true;
                    this.dataSourceFullData.data.push(fullData);
                  }
                } else {
                  nextEntryUpdateDate = new Date(person.biometrics[index + 1].dateUpdated);
                  var entryDate = new Date(new Date(dataEntry.date).setHours(0, 0, 0, 0));
                  if (new Date(new Date(updateDate).setHours(0, 0, 0, 0)) <= entryDate && entryDate < nextEntryUpdateDate) {
                    biometricHasViableActivity = true;
                    this.dataSourceFullData.data.push(fullData);
                  }
                }
              });

              if (!biometricHasViableActivity) {
                var fullData = {
                  PersonID: person.id,
                  Username: person.username,
                  Email: person.email,
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
                  AvgStepsPerDataEntryForBiometricPeriod: 0,
                  ActivityDate: 'N/A',
                  ActivitySteps: 0
                };

                this.dataSourceFullData.data.push(fullData);
              }
            });
          } else {
            person.biometrics.forEach((biometricData, index) => {
              var fullData = {
                PersonID: person.id,
                Username: person.username,
                Email: person.email,
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
                AvgStepsPerDataEntryForBiometricPeriod: 0,
                ActivityDate: 'N/A',
                ActivitySteps: 0
              };

              this.dataSourceFullData.data.push(fullData);
            });
          }
        }
      });
      // Refresh tables with gathered data
      this.dataSourceLatestData.data = this.dataSourceLatestData.data;
      this.dataSourceFullData.data = this.dataSourceFullData.data;

    }, error => {
      console.log("error: " + error);
      // handle error here
    });
  }

  public async getAllPersonDataAndExportToCSV(reportStyle) {
    var filename = "";
    var headers = [];
    var rows = [];
    // Check what type of report should be generated
    switch (reportStyle) {
      // Report for latest metrics for each user
      case "latestMetricsAndAverageSteps":
        filename = 'LatestUserMetricsReport.csv';
        headers = ['PersonID', 'Username', 'Email', 'Signup Date', 'Age', 'Sex', 'Race', 'Latest Height (inches)', 'Latest Weight (lbs)',
          'Latest Waist Circumference (inches)', 'Latest Neck Circumference (inches)', 'Latest Body Fat Percentage (%)',
          'Latest Target Weight Loss Percentage (%)', 'Date Biometrics Updated', 'Average Steps Per Data Entry', 'Average Steps Per Day Across Research Period'];
        
        rows = this.dataSourceLatestData.data;
        break;
      case "allMetricHistory":
        filename = 'AllUserMetricsHistoryReport.csv';
        headers = ['PersonID', 'Username', 'Email', 'Signup Date', 'Age', 'Sex', 'Race', 'Height (inches)', 'Weight (lbs)',
          'Waist Circumference (inches)', 'Neck Circumference (inches)', 'Body Fat Percentage (%)',
          'Target Weight Loss Percentage (%)', 'Date Biometrics Updated', 'Average Steps Per Data Entry Related To This Biometric Data', 'Activity Date', 'Activity Steps'];
          
        rows = this.dataSourceFullData.data;
        break;
      default:
        break;
    }

    // Export data to a csv file report
    this.apiService.exportToCsv(filename, rows, headers);
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

  public onFullUserMetricHistoryReportClick() {
    this.getAllPersonDataAndExportToCSV("allMetricHistory");
  }

  public async onPasswordResetClick() {
    await this.apiService.flagUserForPasswordReset(this.selectedUserForPasswordReset.username, this.selectedUserForPasswordReset.email).then(async response => {
      window.alert('Password Reset For: ' + this.selectedUserForPasswordReset.username);
      // Reset selection to empty
      this.selectedUserForPasswordReset = null;
      this.userSelectForm.reset({});
    }, error => {
      console.log("error: " + error);
      // handle error here
    });
  }

  public onUpdatePersonalInfo() {
    const dialogRef = this.dialog.open(UpdatePersonalInfoDialog, {
      data: {
        personID: this.currentPerson.id,
        full_name: this.currentPerson.full_name,
        email: this.currentPerson.email,
        demographic: this.currentPerson.demographic,
        gender: this.currentPerson.gender,
        age: this.currentPerson.age
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

        }, error => {
          console.log("error: " + error);
          // handle error here
        });
      }
    });
  }

  //User select Form Builder & Form Group
  public userSelectForm = this.fb.group({
    user: [new Person, [Validators.required]]
  },

  {
    validator: this.MustMatch('user')
  })

  getUserControl(name: any): AbstractControl | null {
    return this.userSelectForm.get(name)
  }

  public filteredOptions: Observable<Person[]>;

  private userFilter(value: string): Person[] {
    const filterValue = value.toString().toLowerCase();
    return this.personDataList.filter(user => user.username.toLowerCase().includes(filterValue));
  }

  public displayFn(user: Person): string {
    return user && user.username ? user.username : '';
  }

  MustMatch(controlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const selection: any = control.value;

      if (this.personDataList && this.personDataList.indexOf(selection) < 0) {
        control.setErrors({ MustMatch: true });
      } else {
        control.setErrors(null);
      }
    }
  }

  async ngOnInit(): Promise<void> {
    // If user is not logged in kick to login
    if (!this.appComponent.loggedIn) {
      this.router.navigate(['/login']);
    } else {
      if (this.currentPerson) {

        this.minDate = new Date(this.currentPerson.signupDate);
        this.maxDate = new Date();


        if (this.currentPerson.activities && this.currentPerson.activities.length) {
          this.latestActivityDate = new Date(this.currentPerson.activities[0].date).toDateString();
          this.showCharts = true;
        }
      }

      // See if user is an Admin
      if (this.appComponent.userRoles.includes("ROLE_ADMIN")) {
        // Get table data
        await this.getAllPersonDataForTables();

        this.filteredOptions = this.userSelectForm.get("user").valueChanges.pipe(
          startWith(''),
          map(value => {
            this.userFilter(value || '')
            const username = typeof value === 'string' ? value : value?.username;
            return username ? this.userFilter(username as string) : this.personDataList.slice();
          }),
        );

        this.showAdmin = true;

        setTimeout(() => {
          this.dataSourceLatestData.paginator = this.latestPaginator;
          this.dataSourceFullData.paginator = this.fullPaginator;
        }, 0);
      }
    }
  }
}

export interface BiometricsDialogData {
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
    @Inject(MAT_DIALOG_DATA) public data: BiometricsDialogData,
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

export interface PersonalInfoDialogData {
  personID: number;
  full_name: String;
  email: string;
  demographic: string;
  gender: string;
  age: number;
}

@Component({
  selector: 'update-personal-info-dialog',
  templateUrl: 'update-personal-info-dialog.html',
})
export class UpdatePersonalInfoDialog {
  constructor(
    public dialogRef: MatDialogRef<UpdatePersonalInfoDialog>,
    private appComponent: AppComponent,
    private apiService: APIService,
    @Inject(MAT_DIALOG_DATA) public data: PersonalInfoDialogData,
  ) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSubmitClick(): void {
    this.updatePersonalInfoData();
  }

  private async updatePersonalInfoData() {
    // Update PersonalInfo for this user
    await this.apiService.patchPersonData(this.data.personID, this.data).then(async targetDataResponse => {
      this.dialogRef.close(true);
    }, error => {
      console.log("error: " + error);
      // handle error here
    });
  }
}
