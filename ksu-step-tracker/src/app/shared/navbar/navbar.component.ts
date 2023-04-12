import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Route, Router} from '@angular/router';
import { filter,pairwise} from 'rxjs/operators'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  
  ngOnInit(): void {
    //function showMe here
  }
  
  /*showMe: boolean= true;
  showMe2: boolean= true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((val:Event) => val instanceof NavigationStart)).subscribe((val:any) => {
      if (val.url == '/login' || val.url == '/signup') {
        this.showMe = true;
        this.showMe2 = false;
      }
      else if (val.url == '/user-dashboard' || val.url == '/user-profile'
      || val.url == '/add-steps' || val.url == '/progress' || 
      val.url == '/questionnaire') {
        this.showMe = false;
        this.showMe2 = true;
      }
    })
  }*/

}
