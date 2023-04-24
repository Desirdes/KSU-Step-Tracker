import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Enable use of msSaveBlob for file export
declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean
  }
};

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

  // Get all persons' data
  public async getAllPersonData() {
    const response = await fetch(this.rootURL + '/api/v1/admin/persons', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth }
    });

    if (response.ok) {
      // Get json of return data
      const jsonValue = await response.json();
      return Promise.resolve(jsonValue);
    } else {
      // Get text for error message
      const errorText = await response.text();
      return Promise.reject("Error " + response.status + ": " + errorText);
    }
  }

  // Generate CSV file for data
  public exportToCsv(filename: string, rows: object[], headers?: string[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator: string = ",";

    const keys: string[] = Object.keys(rows[0]);

    let columHearders: string[];

    if (headers) {
      columHearders = headers;
    } else {
      columHearders = keys;
    }

    const csvContent =
      "sep=,\n" +
      columHearders.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];

          cell = cell instanceof Date
            ? cell.toLocaleString()
            : cell.toString().replace(/"/g, '""');

          if (navigator.msSaveBlob) {
            cell = cell.replace(/[^\x00-\x7F]/g, ""); //remove non-ascii characters
          }
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // In case of IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

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

  // Flag user for password reset
  public async flagUserForPasswordReset(username, email) {
    var data = {
      username: username,
      email: email
    };
    var body = JSON.stringify(data);
    const response = await fetch(this.rootURL + '/api/v1/admin/password-reset', {
      method: 'POST',
      body: body,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth }
    });

    if (response.ok) {
      return Promise.resolve();
    } else {
      // Get text for error message
      const errorText = await response.text();
      return Promise.reject("Error " + response.status + ": " + errorText);
    }
  }

  // Reset password
  public async resetPassword(username, password) {
    var data = {
      username: username,
      password: password
    };
    var body = JSON.stringify(data);
    const response = await fetch(this.rootURL + '/access/password-reset', {
      method: 'POST',
      body: body,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ` + this.userBasicAuth }
    });

    if (response.ok) {
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
    const response = await fetch(this.rootURL + '/api/v1/user/persons/' + personID, {
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
    const response = await fetch(this.rootURL + '/api/v1/user/persons/' + personID + '/targets', {
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
    const response = await fetch(this.rootURL + '/api/v1/user/persons/' + personID + '/biometrics', {
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
    const response = await fetch(this.rootURL + '/api/v1/user/persons/' + personID, {
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
    const response = await fetch(this.rootURL + '/api/v1/user/persons/' + personID + '/activities', {
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
    const response = await fetch(this.rootURL + '/api/v1/user/persons/' + personID + '/activities', {
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
