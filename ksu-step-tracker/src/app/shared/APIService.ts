import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  constructor(private http: HttpClient) { }

  // API root URL
 // private rootURL = 'https://ksu-step-tracker-app.herokuapp.com';

  // Temporary localhost api url for testing
  private rootURL = 'http://localhost:5000';

  // Generated after login with format: btoa(username + ":" + password)
  public userBasicAuth = '';

  // User login
  public async loginUser(username, password){
    var data = {
      username: username,
      password: password
    };
    var body = JSON.stringify(data);
    const response = await fetch(this.rootURL + '/access/login', {
      method: 'POST',
      body: body,
      headers: {'Content-Type': 'application/json', 'Authorization': `Basic ` + btoa('user:password')}
    });

    if(response.ok){
      // Get json of return data
      const jsonValue = await response.json();
      return Promise.resolve(jsonValue);
    } else {
      // Get text for error message
      const errorText = await response.text();
      return Promise.reject("Error " + response.status + ": " + errorText);
    }
  }

  // User signup
  public async signupUser(fullName, email, username, password){
    var data = {
      full_name: fullName,
      email: email,
      username: username,
      password: password
    };
    var body = JSON.stringify(data);
    const response = await fetch(this.rootURL + '/access/signup', {
      method: 'POST',
      body: body,
      headers: {'Content-Type': 'application/json', 'Authorization': `Basic ` + btoa('user:password')}
    });

    if(response.ok){
      return Promise.resolve();
    } else {
      // Get text for error message
      const errorText = await response.text();
      return Promise.reject("Error " + response.status + ": " + errorText);
    }
  }

  // Patch person data
  public async patchPersonData(personID, personData){
    var data = {
      full_name: personData.full_name,
      email: personData.email,
      demographic: personData.demographic,
      gender: personData.gender,
      age: personData.age
    };
    var body = JSON.stringify(data);
    const response = await fetch(this.rootURL + '/persons/' + personID, {
      method: 'PATCH',
      body: body,
      headers: {'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth}
    });

    if(response.ok){
      // Get json of return data
      const jsonValue = await response.json();
      return Promise.resolve(jsonValue);
    } else {
      // Get text for error message
      const errorText = await response.text();
      return Promise.reject("Error " + response.status + ": " + errorText);
    }
  }

  // Create target data
  public async createTargetData(personID, targetData){
    var data = {
      dailySteps: targetData.dailySteps,
      weightLoss: targetData.weightLoss,
      weightLossPercentage: targetData.weightLossPercentage
    };
    var body = JSON.stringify(data);
    const response = await fetch(this.rootURL + '/persons/' + personID + '/targets', {
      method: 'POST',
      body: body,
      headers: {'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth}
    });

    if(response.status == 201){
      return Promise.resolve();
    } else {
      return Promise.reject("Error Creating Target Data Entry");
    }
  }

  // Create biometric data
  public async createBiometricData(personID, biometricData){
    var data = {
      bodyFatPercentage: biometricData.bodyFatPercentage,
      height: biometricData.height,
      weight: biometricData.weight,
      neckCircumference: biometricData.neckCircumference,
      waistCircumference: biometricData.waistCircumference
    };
    var body = JSON.stringify(data);
    const response = await fetch(this.rootURL + '/persons/' + personID + '/biometrics', {
      method: 'POST',
      body: body,
      headers: {'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth}
    });

    if(response.status == 201){
      return Promise.resolve();
    } else {
      return Promise.reject("Error Creating Biometric Data Entry");
    }
  }

  // Get person's data by ID
  public async getPersonData(personID){
    const response = await fetch(this.rootURL + '/persons/' + personID, {
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth}
    });

    if(response.ok){
      // Get json of return data
      const jsonValue = await response.json();
      return Promise.resolve(jsonValue);
    } else {
      // Get text for error message
      const errorText = await response.text();
      return Promise.reject("Error " + response.status + ": " + errorText);
    }
  }

  // Get all activity for person
  public async getAllActivity(personID){
    const response = await fetch(this.rootURL + '/persons/' + personID + '/activities', {
      method: 'GET',
      headers: {'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth}
    });

    if(response.ok){
      // Get json of return data
      const jsonValue = await response.json();
      return Promise.resolve(jsonValue);
    } else {
      // Get text for error message
      const errorText = await response.text();
      return Promise.reject("Error " + response.status + ": " + errorText);
    }
  }

  // Create activity entry for person
  public async addActivity(personID, steps, date){
    var data = {
      steps: steps,
      date: date
    };
    var body = JSON.stringify(data);
    const response = await fetch(this.rootURL + '/persons/' + personID + '/activities', {
      method: 'POST',
      body: body,
      headers: {'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth}
    });

    if(response.status == 201){
      return Promise.resolve();
    } else {
      return Promise.reject("Error Creating Activity Data Entry");
    }
  }
}
