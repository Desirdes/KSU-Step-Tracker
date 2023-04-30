import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from './shared/APIService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'ksu-wlt-app';
  selectedFile = null;

  subMenuState:boolean = false;
  burgerClicked(evnt){
    this.subMenuState = evnt;
    console.log("inside burgerClicked: pls. change showMenu to be:",this.subMenuState);
  }


  constructor(
    private http: HttpClient,
    private apiService: APIService
  ) {

  }

  currentPerson = null;

  userRoles = "";

  loggedIn = false;

  ngOnInit(){

  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0];
  }

}
