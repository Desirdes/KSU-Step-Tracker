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

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  })

  getControl(name:any) : AbstractControl | null {
    return this.loginForm.get(name)

  }

  //For backend
  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  public onsubmit() {
    this.loginUser();
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
        }, error => {
          console.log("error: " + error);
          // handle error here
        });
      }
    }, error => {
      console.log("error: " + error);
        // handle error here
    });
  }
}
