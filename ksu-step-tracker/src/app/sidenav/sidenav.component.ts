import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  ngOnInit(): void { }
  constructor() { }

  @Input() sideNavStatus: boolean = false;

  list = [];
}
