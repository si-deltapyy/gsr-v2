import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartPoint } from 'chart.js';
import { BaseChartDirective, Color } from 'ng2-charts';
import { BleCharacteristic } from 'src/app/models/BleCharacteristic';
import { BleDevice } from 'src/app/models/BleDevice';
import { LinearSpace } from 'src/app/models/LinearSpace';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.page.html',
  styleUrls: ['./graph.page.scss'],
})
export class GraphPage implements OnInit {

  private started: boolean = false;
  private selectedService: string = "not-defined"
  private selectedCharacteristic: string = "not-defined"
  
  private counter: number = 0;
  private dataRate: number = 0;
  private samplingFreqInput = 100;
  private xAxisMaxInput = 5;
  //private SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
  //private CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

  private device: BleDevice;
  private status: string = "disabled"

/* Intervals */
  intervals: number[] = [];

/* Signal properties */
  private samplingFreq: number;
  
/* Axis properties */
  private xAxisMin: number = 0;
  private xAxisMax: number = this.xAxisMaxInput;
  private yAxisMin: number = -5;
  private yAxisMax: number = 5;
  private time: LinearSpace;

 /* Plotting properties */ 
  private transitionTime = 0.5;
  private updateTime = 0.2;

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
      borderColor: '#174DF0',
      backgroundColor: '#ff00ff'
    },
    {
      borderColor: '#174DF0',
      backgroundColor: '#ff00ff'
    },
    {
      borderColor: '#ff0000',
      backgroundColor: '#ff0000',
    }
  ];

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(private bleSrv: BleService, private ngZone: NgZone) { 
    this.refresh();
    this.device = this.bleSrv.getSelectedDevice();
    this.bleSrv.getObservableStatus().subscribe((status) => {
      this.status = status;
    })    
  }

  ionViewWillEnter() {
    this.device = this.bleSrv.getSelectedDevice();
    this.bleSrv.UpdateStatus();
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
    
    this.counter++;
  }

  private onStart() {
    if (!this.started) {
      this.started = true;
      let interval: number = 0;

      /* Update chart view */
      interval = window.setInterval(() => {
        this.chart.update();
      }, 1000 * this.updateTime);
      this.intervals.push(interval);

      /* Calculate data rate */
      interval = window.setInterval(() => {
        this.dataRate = this.counter;
        this.counter = 0;
      }, 1000);
      this.intervals.push(interval);

      if (this.selectedService === "not-defined") {
        //generate test signal: sine wave
        interval = window.setInterval(() => {
          for (let i = 0; i < (this.samplingFreq * this.updateTime); i++) {
            let t: number = this.time.getNext();
            let y: number = Math.sin(2 * Math.PI * 2 * t);
            let point: ChartPoint = { x: t, y: y };
            this.addNewPoint(point);
          }
          this.chart.update();

        }, 1000 * this.updateTime);
        this.intervals.push(interval);
      }
      else {
        this.bleSrv.startNotification(this.selectedService, this.selectedCharacteristic, this.onDataChange).subscribe(
          (data) => this.onDataChange(data),
          () => this.bleSrv.alert('Unexpected Error', 'Failed to subscribe to this characteristic'));
      }
    }
  }

  private onStop() {
    this.started = false;
    for (let i = 0; i < this.intervals.length;i++)
      clearInterval(this.intervals[i]);
    this.bleSrv.stopNotification(this.selectedService, this.selectedCharacteristic);
  }

  private disconnect() {
    console.log("disconnecting");
    this.onStop();
    this.bleSrv.disconnect(this.device.id);
  }

  private connect() {
    this.bleSrv.connect(this.device.id);
  }

  onDataChange(data) {
    let dat = new Uint32Array(data[0]);
    console.log(dat.toString());
    //this.ngZone.run(() => {
      let t: number = this.time.getNext();
      let y: number = dat[0];
      let point: ChartPoint = {x:t,y:y};
    this.addNewPoint(point);
    //}); 
  }

  onBluetoothDisabled() {
    this.bleSrv.alert("Bluetooth Disabled", "Please enable the Bluetooth and Location");
  }

  refresh() {
    this.samplingFreq = this.samplingFreqInput;
    this.xAxisMax = this.xAxisMaxInput;
    this.time = new LinearSpace(this.xAxisMin, 1 / this.samplingFreq, this.xAxisMax * this.samplingFreq);
    this.chartOptions.scales.xAxes[0].ticks.max = this.xAxisMaxInput;
    
  }

  onRefresh() {
    if (this.samplingFreqInput > 1 && this.samplingFreqInput <= 500 && this.xAxisMaxInput >= 1 && this.xAxisMaxInput <= 10) {
      this.refresh();
      this.chart.ngOnInit();
    } else {
      alert("Invalid Inputs \n Sampling Freq: [1-500] \n Max Time: [1-30]")
    }
    this.device = this.bleSrv.getSelectedDevice();
    this.bleSrv.UpdateStatus();
  }


  /* The filter implementation is wrote in this way to not lose this reference. 
   * this function is called in other context. For alternative solution search: bind(this)
   */
  private filterCharByService = (char: BleCharacteristic):boolean => {
     return (char.service === this.selectedService);
  }

}
