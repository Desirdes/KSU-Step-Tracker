import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
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
    public appComponent: AppComponent,
    private apiService: APIService,
    private router: Router
  ) { }

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

  public onLogoutClick() {
    this.appComponent.currentPerson = null;
    this.appComponent.userRoles = "";
    this.appComponent.loggedIn = false;
    this.router.navigate(["/login"]);
  }
}
