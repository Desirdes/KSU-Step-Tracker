import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { APIService } from './shared/APIService';
import { Person } from './shared/models/UserData.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'ksu-wlt-app';
  selectedFile = null;

  constructor(
    private http: HttpClient,
    private apiService: APIService
  ) {

  }

  currentPerson = new Person();

  userRoles = "";

  // In case we need to test things on application init
  ngOnInit(){

  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0];
  }

  onUpload(){
    // this.http.
  }

}
