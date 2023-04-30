import { Component, forwardRef } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APIService } from '../shared/APIService';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: APIService,
    private appComponent: AppComponent
  ) { }

  public resetPassword = false;

  public invalidLogin = false;

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  })

  passwordResetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  },

  {
    validator: this.MustMatch('password', 'confirmPassword')
  })

  getControl(name:any) : AbstractControl | null {
    return this.loginForm.get(name)
  }

  getControlResetPassword(name: any): AbstractControl | null {
    return this.passwordResetForm.get(name)
  }

  //Must Match Validator function
  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['MustMatch']) {
        return
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ MustMatch: true });
      }
      else {
        matchingControl.setErrors(null)
      }
    }
  }

  public onsubmit() {
    this.loginUser();
  }

  public async onResetPasswordClick() {
    await this.apiService.resetPassword(this.appComponent.currentPerson.username, this.passwordResetForm.get('password').value).then(async response => {
      // If the password was reset then finish setting things up for them and update user auth
      this.apiService.userBasicAuth = btoa(this.appComponent.currentPerson.username + ":" + this.passwordResetForm.get('password').value);

      // If user is not an admin but their biometrics have not been recorded then redirect to questions
      if (!this.appComponent.currentPerson.biometrics.length) {
        this.router.navigate(['/questionnaire']);
      } else {
        // Sort by order of date steps were done, latest to oldest
        this.appComponent.currentPerson.activities.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // Route to dashboard
        this.router.navigate(['/user-dashboard']);
      }
    }, error => {
      console.log("error: " + error);
      // handle error here
    });
  }

  private async loginUser(){
    // Login user then send to dashboard
    await this.apiService.loginUser(this.loginForm.get('username').value, this.loginForm.get('password').value).then(async loginResponse => {
      // On successful login set the user basic auth
      this.apiService.userBasicAuth = btoa(this.loginForm.get('username').value + ":" + this.loginForm.get('password').value);

      this.appComponent.userRoles = loginResponse.roles;

      // If the login is correct and the user is an Admin without any person data then just set currentPerson to null and continue to dashboard
      if (loginResponse.roles.includes("ROLE_ADMIN") && loginResponse.personID == null) {
        this.appComponent.currentPerson = null;
        this.appComponent.loggedIn = true;
        this.router.navigate(['/user-dashboard']);
      } else {
        await this.apiService.getPersonData(loginResponse.personID).then(async getPersonResponse => {
          // Update local variables for person data of user
          this.appComponent.currentPerson = getPersonResponse;
          this.appComponent.loggedIn = true;

          // Check if the user needs to update their password
          if (loginResponse.resetPassword) {
            this.resetPassword = true;
          } else {
            // If user is not an admin but their biometrics have not been recorded then redirect to questions
            if (!getPersonResponse.biometrics.length) {
              this.router.navigate(['/questionnaire']);
            } else {
              // Sort by order of date steps were done, latest to oldest
              this.appComponent.currentPerson.activities.sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
              });

              // Route to dashboard
              this.router.navigate(['/user-dashboard']);
            }
          }
          
        }, error => {
          console.log("error: " + error);
          // handle error here
        });
      }
    }, error => {
      console.log("error: " + error);
        // handle error here
      this.invalidLogin = true;
    });
  }
}
