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
   if (this.currentPerson.activities && this.currentPerson.activities.length){
      var targetStepsArray = [];
      var activityArray = this.currentPerson.activities;
      var dateArray = [];
      var stepsArray = [];
      // Used to make a comparison line for chart
     var targetStepsArray = [];

     activityArray.forEach((activity, activityIndex) => {
       var currentTargetSteps = 0
       var entryDate = new Date(activity.date).setHours(0, 0, 0, 0);
       this.currentPerson.targets.forEach((targetData, index) => {
         var updateDate = new Date(targetData.dateUpdated).setHours(0, 0, 0, 0);
          //Check if this is the latest entry
          if (index == this.currentPerson.targets.length - 1) {
              if (entryDate >= updateDate) {
                currentTargetSteps = targetData.dailySteps;
              }
          } else {
            var nextEntryUpdateDate = new Date(this.currentPerson.targets[index + 1].dateUpdated).setHours(0, 0, 0, 0);
              if (updateDate <= entryDate && entryDate < nextEntryUpdateDate) {
                currentTargetSteps = targetData.dailySteps;
              }
          }
       });

       // Check if first entry
       if (activityIndex == 0) {
         dateArray.unshift(new Date(activity.date).toDateString());
         stepsArray.unshift(activity.steps);
         targetStepsArray.unshift(currentTargetSteps);
       } else {
         var previousEntry = activityArray[activityIndex - 1];
         // If the date is the same as previous entry then combine them
         if (new Date(activity.date).setHours(0, 0, 0, 0) == new Date(previousEntry.date).setHours(0, 0, 0, 0)) {
           stepsArray[stepsArray.length - 1] += activity.steps;
         } else {
           dateArray.unshift(new Date(activity.date).toDateString());
           stepsArray.unshift(activity.steps);
           targetStepsArray.unshift(currentTargetSteps);
         }
       }
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

  //Circle Progress Bar//
  public currentWeeklyProgressPercentage = 0;
  public currentMonthlyProgressPercentage = 0;
  public lastWeekProgressPercentage = 0;
  public lastMonthProgressPercentage = 0;

  public calculateProgressBarData() {
    // Check is user has any activity to chart
    if (this.currentPerson.activities && this.currentPerson.activities.length) {
      var activityArray = this.currentPerson.activities;

      var today = new Date();
      var startOfWeek = new Date(new Date(new Date().setDate(today.getDate() - ((today.getDay() || 7) - 1))).setHours(0, 0, 0, 0));
      var endOfWeek = new Date(new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6)).setHours(23, 59, 59, 0));

      var startOfLastWeek = new Date(new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() - 7)).setHours(0, 0, 0, 0));
      var endOfLastWeek = new Date(new Date(new Date(startOfLastWeek).setDate(startOfLastWeek.getDate() + 6)).setHours(23, 59, 59, 0));

      var startOfMonth = new Date(new Date(today.getFullYear(), today.getMonth(), 1).setHours(0, 0, 0, 0));
      var endOfMonth = new Date(new Date(today.getFullYear(), today.getMonth() + 1, 0).setHours(23, 59, 59, 0));

      var startOfLastMonth = new Date(new Date(today.getFullYear(), today.getMonth() - 1, 1).setHours(0, 0, 0, 0));
      var endOfLastMonth = new Date(new Date(today.getFullYear(), today.getMonth(), 0).setHours(23, 59, 59, 0));

      // The progress will just be based off of most recent target rather than the targets active during each individual dataentry
      var currentTargetStepsPerDay = this.currentPerson.targets[this.currentPerson.targets.length - 1].dailySteps;
      var stepsThisWeek = 0;
      var stepsThisMonth = 0;
      var stepsLastWeek = 0;
      var stepsLastMonth = 0;

      activityArray.forEach(activity => {
        var entryDate = new Date(activity.date);
        //Check if this is the latest entry
        if (startOfWeek <= entryDate && entryDate <= endOfWeek) {
          stepsThisWeek += activity.steps;
        }
        if (startOfMonth <= entryDate && entryDate <= endOfMonth) {
          stepsThisMonth += activity.steps;
        }
        if (startOfLastWeek <= entryDate && entryDate <= endOfLastWeek) {
          stepsLastWeek += activity.steps;
        }
        if (startOfLastMonth <= entryDate && entryDate <= endOfLastMonth) {
          stepsLastMonth += activity.steps;
        }
      });

      this.currentWeeklyProgressPercentage = +((stepsThisWeek / (currentTargetStepsPerDay * 7)) * 100).toFixed(1);
      this.currentMonthlyProgressPercentage = +((stepsThisMonth / (currentTargetStepsPerDay * endOfMonth.getDate())) * 100).toFixed(1);
      this.lastWeekProgressPercentage = +((stepsLastWeek / (currentTargetStepsPerDay * 7)) * 100).toFixed(1);
      this.lastMonthProgressPercentage = +((stepsLastMonth / (currentTargetStepsPerDay * endOfLastMonth.getDate())) * 100).toFixed(1);
    }
  }

  public updateProgressBar() {
    var leftWeekly = document.getElementById('left-progress-bar-weekly');
    var rightWeekly = document.getElementById('right-progress-bar-weekly');
    if (this.currentWeeklyProgressPercentage > 0) {
      if (this.currentWeeklyProgressPercentage <= 50) {
        rightWeekly.style.setProperty('transform', 'rotate(' + this.percentageToDegrees(this.currentWeeklyProgressPercentage) + 'deg)');
      } else {
        rightWeekly.style.setProperty('transform', 'rotate(180deg)');
        leftWeekly.style.setProperty('transform', 'rotate(' + this.percentageToDegrees(Math.min(this.currentWeeklyProgressPercentage, 100) - 50) + 'deg)');
      }
    }

    var leftMonthly = document.getElementById('left-progress-bar-monthly');
    var rightMonthly = document.getElementById('right-progress-bar-monthly');
    if (this.currentMonthlyProgressPercentage > 0) {
      if (this.currentMonthlyProgressPercentage <= 50) {
        rightMonthly.style.setProperty('transform', 'rotate(' + this.percentageToDegrees(this.currentMonthlyProgressPercentage) + 'deg)');
      } else {
        rightMonthly.style.setProperty('transform', 'rotate(180deg)');
        leftMonthly.style.setProperty('transform', 'rotate(' + this.percentageToDegrees(Math.min(this.currentMonthlyProgressPercentage, 100) - 50) + 'deg)');
      }
    }
  };

  public percentageToDegrees(percentage) {

    return percentage / 100 * 360

  }


  ngOnInit(): void {
    this.createLineChart();

    this.calculateProgressBarData();
    this.updateProgressBar();
  }
}
