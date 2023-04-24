import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

  @Output() sidenavClose = new EventEmitter();

  public sideNavClose = ()=> {
    this.sidenavClose.emit();
  }

  /*@Input() subMenuState;
  constructor() { }
  opened: boolean;
  showMenu = true;*/



  ngOnInit() {}
}
