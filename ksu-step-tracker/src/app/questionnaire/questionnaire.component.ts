import { Component, forwardRef, OnInit, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { AppComponent } from '../app.component';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { APIService } from '../shared/APIService';
import { Person, TargetData, BiometricData } from '../shared/models/UserData.model';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css'],
})

export class QuestionnaireComponent {
  integerRegex = /^\d+$/
  integerRegexDecimal = /^\d*\.?\d*$/

  questionnaireForm = this.fb.group({
    age: ['', [Validators.required, Validators.max(40), Validators.min(19), Validators.pattern(this.integerRegex)]],
    sex: ['', [Validators.required]],
    race: ['', [Validators.required]],
    height: ['', [Validators.required, Validators.pattern(this.integerRegexDecimal)]],
    weight: ['', [Validators.required, Validators.pattern(this.integerRegexDecimal)]],
    waistCircumference: ['', [Validators.required, Validators.pattern(this.integerRegexDecimal)]],
    neckCircumference: ['', [Validators.required, Validators.pattern(this.integerRegexDecimal)]],
    bodyFatPercentage : ['', [Validators.required, Validators.pattern(this.integerRegexDecimal)]],
    targetWeightLossPercentage: ['', [Validators.required]]
  })

  getControl(name:any) : AbstractControl | null {
    return this.questionnaireForm.get(name)
  }

  //For backend
  get age() { return this.questionnaireForm.get('age'); }
  get dateOfBirth() { return this.questionnaireForm.get('dateOfBirth'); }
  get sex() { return this.questionnaireForm.get('sex'); }
  get race() { return this.questionnaireForm.get('race'); }
  get height() { return this.questionnaireForm.get('height'); }
  get weight() { return this.questionnaireForm.get('weight'); }
  get waistCircumference() { return this.questionnaireForm.get('waistCircumference'); }
  get neckCircumference() { return this.questionnaireForm.get('neckCircumference'); }
  get targetWeightLossPercentage() { return this.questionnaireForm.get('targetWeightLossPercentage'); }
  get bodyFatPercentage() { return this.questionnaireForm.get('bodyFatPercentage'); }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private appComponent: AppComponent,
    private apiService: APIService
  ) { }

  public targetWeight = 0;
  public targetBodyFatPercentage = 0;
  public stepsPerDay = 0;
  public lbsConversionToKG = 2.2;
  public percentageConversionToKG = 0.2;

  //Send query param to user-dashboard
  public onsubmit() {
    this.calcTargetBodyFatPercentage();
    this.calcTargetWeight();
    this.calcSteps();

    this.updatePersonData();
  }

  private async updatePersonData(){
    // Basic data
    var personData = new Person();
    personData.age = +this.questionnaireForm.get('age').value;
    personData.gender = this.questionnaireForm.get('sex').value;
    personData.demographic = this.questionnaireForm.get('race').value;

    // Target Data
    var targetData = new TargetData();
    targetData.dailySteps = this.stepsPerDay;
    targetData.weightLoss = +this.questionnaireForm.get('weight').value - this.targetWeight;
    targetData.weightLossPercentage = +this.questionnaireForm.get('targetWeightLossPercentage').value;

    // Biometric data
    var biometricData = new BiometricData();
    biometricData.bodyFatPercentage = +this.questionnaireForm.get('bodyFatPercentage').value;
    biometricData.height = +this.questionnaireForm.get('height').value;
    biometricData.neckCircumference = +this.questionnaireForm.get('neckCircumference').value;
    biometricData.waistCircumference = +this.questionnaireForm.get('waistCircumference').value;
    biometricData.weight = +this.questionnaireForm.get('weight').value;

    // Patch basic data for person
    await this.apiService.patchPersonData(this.appComponent.currentPerson.id, personData).then(async personDataResponse => {
      // Create first target entry
      await this.apiService.createTargetData(this.appComponent.currentPerson.id, targetData).then(async targetDataResponse => {
        // Create first biometric entry
        await this.apiService.createBiometricData(this.appComponent.currentPerson.id, biometricData).then(async biometricDataResponse => {
          // Get updated person data to update local variables
          await this.apiService.getPersonData(this.appComponent.currentPerson.id).then(async getPersonResponse => {
            // Update local variables for person data of user
            this.appComponent.currentPerson = getPersonResponse;
            if(getPersonResponse.activities == null){
              this.appComponent.currentPerson.activities = [];
            }

            // Route to dashboard
            this.router.navigate(['/user-dashboard']);
          }, error => {
            console.log("error: " + error);
            // handle error here
          });
        }, error => {
          console.log("error: " + error);
          // handle error here
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

  //Round to the nearest 10th
  public calcTargetWeight() {
    var currentWeight = +this.questionnaireForm.value.weight;
    var targetWeightLoss = (+this.questionnaireForm.value.targetWeightLossPercentage/100)*currentWeight;
    var targetWeight = currentWeight - targetWeightLoss;
    this.targetWeight = +targetWeight.toFixed(2);
  }

  public calcTargetBodyFatPercentage() {
    var currentBodyFatPercentageDecimal = (+this.questionnaireForm.value.bodyFatPercentage/100);
    var currentFatMass = currentBodyFatPercentageDecimal * (+this.questionnaireForm.value.weight/this.lbsConversionToKG);
    var targetWeightLossKG = (+this.questionnaireForm.value.targetWeightLossPercentage/100) * (+this.questionnaireForm.value.weight/this.lbsConversionToKG);
    var newFatMass = currentFatMass - targetWeightLossKG;
    var targetWeightKG = (+this.questionnaireForm.value.weight/this.lbsConversionToKG) - targetWeightLossKG;
    var targetBodyFatPercentage = (newFatMass / targetWeightKG) * 100;
    this.targetBodyFatPercentage = +targetBodyFatPercentage;
  }

  public calcSteps() {
    if(this.questionnaireForm.value.sex == "Male") {
      var stepsPerKGPerDay =  39377.34 / (Math.pow(this.targetBodyFatPercentage,1.3405));
      this.stepsPerDay = +stepsPerKGPerDay * ((+this.questionnaireForm.value.weight!/this.lbsConversionToKG) * (+this.questionnaireForm.value.bodyFatPercentage!/100));
      this.stepsPerDay = +this.stepsPerDay.toFixed(0);
    }
    else if (this.questionnaireForm.value.sex == "Female") {
      var stepsPerKGPerDay =  261425.4 / (Math.pow(this.targetBodyFatPercentage,1.8797));
      this.stepsPerDay = +stepsPerKGPerDay * ((+this.questionnaireForm.value.weight!/this.lbsConversionToKG) * (+this.questionnaireForm.value.bodyFatPercentage!/100));
      this.stepsPerDay = +this.stepsPerDay.toFixed(0);
    }
  }
}
