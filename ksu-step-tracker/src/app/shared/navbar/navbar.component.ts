import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Route, Router } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators'
import { AppComponent } from 'src/app/app.component';
import { APIService } from '../APIService';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Output() menuState = new EventEmitter();

  constructor(
    private appComponent: AppComponent,
    private apiService: APIService) { }

  //API
  public currentPerson = this.appComponent.currentPerson;

  opened: boolean;
  showMenu = false; /* false by default, since hidden */
  toggleMenu() {
      console.log("inside toggleMenu");
      this.showMenu = !this.showMenu;
      this.menuState.emit(this.showMenu);
   }
  ngOnInit() {
    this.openModal;
    this.onCloseHandled;
    this.toggleMenu;
  }

  //Modal
  display = "";
  openModal() {
    this.display = "block";
  }
  onCloseHandled() {
    this.display = "none";
  }

}
