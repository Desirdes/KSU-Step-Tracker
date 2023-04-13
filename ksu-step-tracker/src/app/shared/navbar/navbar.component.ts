import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Route, Router } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Output() sideNavToggle = new EventEmitter<boolean>();
  menuStatus: boolean = false;

  constructor() { }

  ngOnInit(): void { }

  sideNavClick() {
    this.menuStatus = !this.menuStatus;
    this.sideNavToggle.emit(this.menuStatus);

  }

}
