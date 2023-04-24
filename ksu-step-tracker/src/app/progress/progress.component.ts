import { Component, Input, OnInit } from '@angular/core';
import { Chart, ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})

export class ProgressComponent implements OnInit{

  
  ngOnInit(): void {
    this.updateProgressBar();
    this.createBarChart();
    this.filterData();
    this.showMessage();
  }
  //Circle Progress Bar//
  public updateProgressBar() {

    var progressBar = document.getElementById('circular-progress-bar');
    var value = +progressBar.getAttribute('data-value');
    var left = document.getElementById('left-progress-bar');
    var right = document.getElementById('right-progress-bar');
    
    if (value > 0) {
      if (value <= 50) {
        right.style.setProperty('transform', 'rotate(' + this.percentageToDegrees(value) + 'deg)');
      } else {
        right.style.setProperty('transform', 'rotate(180deg)');
        left.style.setProperty('transform', 'rotate(' + this.percentageToDegrees(value - 50) + 'deg)');
      }
    }
    
    };

    public percentageToDegrees(percentage) {
    
      return percentage / 100 * 360
    
    }
    //Motivational Progress Message//
    alert:boolean = false
    alert2:boolean = false
    alert3:boolean = false
    alert4:boolean = false

    public showMessage() {
      var progressBar = document.getElementById('circular-progress-bar');
      var value = +progressBar.getAttribute('data-value');
      
        if (value > 0) {
          if (value <= 50) {
            this.alert2 = true;
          }
          else if (value > 50 && value <100) {
            this.alert3 = true;
          }
          else if (value == 100) {
            this.alert = true;
          }
        }
        else {
          this.alert4 = true;
        }
      }

    closeAlert() {
      this.alert = false
      this.alert2 = false
      this.alert3 = false
    }
  
  //Chart.JS stuff//
  public barChart: any; 
  public dates;
  public dates2;
  public datapoints;
  public datapoints2;



  //Line Chart
 public createBarChart(){ 
  this.dates = ['2023-04-02', '2023-04-03', '2023-04-04', '2023-04-05',
   '2023-04-06', '2023-04-07', '2023-04-08'];
  this.datapoints = [100, 200, 300, 400, 500, 600, 700];
  this.datapoints2 = [200, 300, 400, 500, 600, 700, 800];
  this.barChart = new Chart("MyBarChart", {
    type: 'bar', //this denotes tha type of chart
    
      data: {// values on X-Axis
        labels: this.dates,
	      datasets: [
          {
            label: "My Step Count",
            data: this.datapoints,
            backgroundColor: 'blue'
          },
          {
            label: "Target Step Count",
            data: this.datapoints2,
            backgroundColor: 'limegreen'
          }  
        ]
      },
      options: {
        aspectRatio:2.5
      }
  });
  }

  public filterData() {
    const dates2 = [...this.dates];
    const startDate = <HTMLInputElement>document.getElementById('startDate');
    const endDate = <HTMLInputElement>document.getElementById('endDate');

    //get index number in array
    const indexStartDate = dates2.indexOf(startDate.value);
    const indexEndDate = dates2.indexOf(endDate.value);

    //slice the array to only show selected section
    const filterDate = dates2.slice(indexStartDate, indexEndDate + 1);

    //replace labels in chart
    this.barChart.config.data.labels = filterDate;

    //replace datapoints
    const newdatapoints = [...this.datapoints];
    const newdatapoints2 = [...this.datapoints2];
    const filterDataPoints = newdatapoints.slice(indexStartDate, indexEndDate + 1);
    const filterDataPoints2 = newdatapoints2.slice(indexStartDate, indexEndDate + 1);
    this.barChart.config.data.datasets[0].data = filterDataPoints, filterDataPoints2;

    this.barChart.update();
  }
}
