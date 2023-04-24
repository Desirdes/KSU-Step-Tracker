import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators'
import { AppComponent } from 'src/app/app.component';
import { APIService } from '../APIService';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  //public sidenav;
  @Output() public sideNavToggle = new EventEmitter();
  //@ViewChild('sidenav', {static:false}) sidenav: MatSidenav;

  constructor(
    public appComponent: AppComponent,
    private apiService: APIService,
    private router: Router
  ) { }

  //Open main nav menu
  collapsed = false; /* false by default, since hidden */

  //Open sidenav menu
  sideCollapsed: boolean = false;

  //Toggle Nav Menu
  toggleMenu() {
      this.collapsed = !this.collapsed;
   }

   //Toggle Sidenav Menu
   public toggleSideMenu = () => {
    this.sideNavToggle.emit();
    //this.sideCollapsed  =!this.sideCollapsed;
 }

  ngOnInit() {}

  // Later might add a confirm dialog to ensure user wants to logout
  public onLogoutClick() {
    this.appComponent.currentPerson = null;
    this.appComponent.userRoles = "";
    this.router.navigate(["/login"]);
  }
}
