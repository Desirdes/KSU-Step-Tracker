import { Component } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APIService } from '../shared/APIService';
import { AppComponent } from '../app.component';
import { Person } from '../shared/models/UserData.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: APIService,
    private appComponent: AppComponent
  ) { }

  signupForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  },

  {
    validator: this.MustMatch('password', 'confirmPassword')
  })

  //Get ControlName function
  getControl(name:any) : AbstractControl | null {
    return this.signupForm.get(name)
  }

  //Must Match Validator function
  MustMatch(controlName: string, matchingControlName: string){
    return(formGroup:FormGroup)=>{
      const control =formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if(matchingControl.errors && !matchingControl.errors['MustMatch']){
        return
      }
      if(control.value !== matchingControl.value){
        matchingControl.setErrors({MustMatch:true});
      }
      else {
        matchingControl.setErrors(null)
      }
    }
  }

  //For backend
  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get username() { return this.signupForm.get('username'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }


  public onsubmit() {
    this.signupUser();
  }

  private async signupUser(){
      await this.apiService.signupUser(this.signupForm.get('name').value, this.signupForm.get('email').value, this.signupForm.get('username').value, this.signupForm.get('password').value).then(async signupResponse => {
        // Login user then send to questions
        await this.apiService.loginUser(this.signupForm.get('username').value, this.signupForm.get('password').value).then(loginResponse => {
          // On successful login set the user basic auth
          this.apiService.userBasicAuth = btoa(this.signupForm.get('username').value + ":" + this.signupForm.get('password').value);

          this.appComponent.currentPerson = new Person();

          // Set the personID and username for logged in user
          this.appComponent.currentPerson.id = loginResponse.personID;
          this.appComponent.currentPerson.username = loginResponse.username;

          this.appComponent.userRoles = loginResponse.roles;

          this.appComponent.loggedIn = true;

          // Route to questionnaire
          this.router.navigate(['/questionnaire']);
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

