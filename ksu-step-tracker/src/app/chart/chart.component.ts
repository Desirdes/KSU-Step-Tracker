import { Component, OnInit } from '@angular/core';
import { Chart, ChartDataset, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts/public_api';
import { AppComponent } from '../app.component';
import { APIService } from '../shared/APIService';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit{

  constructor(
    private appComponent: AppComponent,
    private apiService: APIService
  ) {}

 public lineChart: any;
 public donutChart: any;

 public currentPerson = this.appComponent.currentPerson;

 //Line Chart
 createLineChart(){
  // Check is user has any activity to chart
   if (this.currentPerson.activities.length){
    var targetSteps = this.currentPerson.targets[0].dailySteps;
     var activityArray = this.currentPerson.activities;
    var dateArray = [];
    var stepsArray = [];
    // Used to make a line for chart
    var targetStepsArray = [];
    activityArray.forEach(activity => {
      dateArray.unshift(new Date(activity.date).toDateString());
      stepsArray.unshift(activity.steps);
      targetStepsArray.unshift(targetSteps);
    });
    this.lineChart = new Chart("MyChart", {
        type: 'line', //this denotes tha type of chart

        data: {// values on X-Axis
          labels: dateArray,
           datasets: [
            {
              label: "Target Steps Per Day",
              data: targetStepsArray,
              backgroundColor: 'red'
            },
            {
              label: "Step Count Per Day",
              data: stepsArray,
              backgroundColor: 'lightblue'
            }
          ]
        },
        options: {
          aspectRatio:2.5
        }
      });
  }
}

//Donut Chart
/*createDonutChart(){

  this.lineChart = new Chart("MyDonutChart", {
    type: 'doughnut',
    data: {
      labels: [
        'Target Step Count',
        'Current Step Count'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [10756, 9465],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
        ],
        hoverOffset: 4
      }]
    }
  }
)}*/

ngOnInit(): void {
  this.createLineChart();
  //this.createDonutChart();
}


}
