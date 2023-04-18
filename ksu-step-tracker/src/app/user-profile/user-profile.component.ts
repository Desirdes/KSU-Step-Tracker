import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Chart } from 'node_modules/chart.js';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit{
  
  //Sidebar Menu
  subMenuState:boolean = false;
  burgerClicked(evnt){
    this.subMenuState = evnt;
    console.log("inside burgerClicked: pls. change showMenu to be:",this.subMenuState);
  }

  ngOnInit(): void {}
  isDisabled:boolean = true;
  // @ViewChild('f') editForm: NgForm
  // onSubmit(form: NgForm){
  //   this.editForm.value.username
  // }

  edit(){
    this.isDisabled=false
  }

  update(){
    this.isDisabled= true
  }

  
}

