import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartPoint } from 'chart.js';
import { BaseChartDirective, Color } from 'ng2-charts';
import { LinearSpace } from 'src/app/models/LinearSpace';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.page.html',
  styleUrls: ['./graph.page.scss'],
})
export class GraphPage implements OnInit {

  private state: string = "disabled"

/* Signal properties */
  private samplingFreq: number = 1000;
  
/* Axis properties */
  private xAxisMin: number = 0;
  private xAxisMax: number = 10;
  private yAxisMin: number = -5;
  private yAxisMax: number = 5;
  private time: LinearSpace;

 /* Plotting properties */ 
  private transitionTime = 0.5;
  private updateTime = 0.1;

/* Line properties */
  private lineWitdh = 2;

/* Internal state variables */
  private iNew = 0;
  private iOld = 1;
  private lastTime = 0;

  private chartData: ChartDataSets[] = [{ data: [], label: "buffer1", fill: false ,borderWidth: this.lineWitdh},{ data: [], label: "buffer2", fill: false,borderWidth: this.lineWitdh},{ data: [], label: "point", fill: false,pointRadius: 5}];
  private chartLabels = [];
  private chartType = "line"
  private showLegend = false;
  private chartOptions: ChartOptions = {
    animation: {
      duration: 0
    },
    elements: {
      point: {
        radius: 0  
      }
    },
    responsive: true,
    scales: {
      xAxes: [{
        type: 'linear',
        ticks: { min: this.xAxisMin, max: this.xAxisMax, stepSize: 1}
      }],
      gridLines: {
        display: true,
        color: 'rgba(255,0,0,0.3)'
      },      
    }
  }

  private chartColors: Color[] = [
    {
      borderColor: '#ffffff',
      backgroundColor: '#ff00ff'
    },
    {
      borderColor: '#ffffff',
      backgroundColor: '#ff00ff'
    }
  ];

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor() { 
    this.time = new LinearSpace(this.xAxisMin, 1 / this.samplingFreq, this.xAxisMax*this.samplingFreq);
  }

  ngOnInit() {
  }

  private swapIndex() {
    let aux = this.iNew;
    this.iNew = this.iOld;
    this.iOld = aux;
  }

  private addNewPoint(point: ChartPoint) {
    //drawing point
    this.chartData[2].data = [point];
    if (point.x >= this.lastTime) {
      this.lastTime = point.x as number;
      (this.chartData[this.iNew].data as  ChartPoint[]).push(point);
      this.chartData[this.iOld].data.shift();
    } else {
      this.chartData[this.iOld].data = [point];
      for (let i = 0; i < (this.transitionTime * this.samplingFreq); i++)
        this.chartData[this.iNew].data.shift();
      this.lastTime = 0; 
      this.swapIndex();      
    }   
  }


  private interval;

  private onStart() {
    this.interval = setInterval(() => {
      for (let i = 0; i < (this.samplingFreq*this.updateTime); i++) {
        let t:number = this.time.getNext();
        let point: ChartPoint = {x:t,y:Math.sin(2 * Math.PI * 2 * t)};
        this.addNewPoint(point);
      }
      this.chart.update();
         
    },1000*this.updateTime);
  }

  private onStop() {
    clearInterval(this.interval);
  }
}
