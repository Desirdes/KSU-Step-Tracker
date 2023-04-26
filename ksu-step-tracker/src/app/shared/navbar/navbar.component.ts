import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { APIService } from '../APIService';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    public appComponent: AppComponent,
    private router: Router
  ) { }

  ngOnInit() {}

  public onLogoutClick() {
    this.appComponent.currentPerson = null;
    this.appComponent.userRoles = "";
    this.appComponent.loggedIn = false;
    this.router.navigate(["/login"]);
  }
}
