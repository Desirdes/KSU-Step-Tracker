import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit, OnChanges {
  @Input() subMenuState;
  constructor() { }
  opened: boolean;
  showMenu = true;

  ngOnInit() {
  }

  ngOnChanges(){
    console.log("inside ngOnChanges with subMenuState: ",this.subMenuState );
    this.showMenu = this.subMenuState;
  }
}
