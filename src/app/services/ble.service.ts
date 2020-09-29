import { Injectable, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { ToastController } from '@ionic/angular';
import { monkeyPatchChartJsLegend, ThemeService } from 'ng2-charts';
import { BehaviorSubject, Observable } from 'rxjs';
import { BleAdvertisingPacket } from '../models/BleAdvertisingPacket';
import { BleDevice } from '../models/BleDevice';


@Injectable({
  providedIn: 'root'
})
export class BleService {
  private selectedDevice: BleDevice;
  private statusSubject: BehaviorSubject<string>;
  public readonly status: Observable<string>;
  private listSubject: BehaviorSubject<BleAdvertisingPacket[]>;
  public readonly list: Observable<BleAdvertisingPacket[]>;

  constructor(private ble: BLE, private toastCtrl: ToastController,private ngZone: NgZone) { 
    this.selectedDevice = this.getMockDevice();

    this.listSubject = new BehaviorSubject <BleAdvertisingPacket[]>([]);
    this.list = this.listSubject.asObservable();

    this.statusSubject = new BehaviorSubject <string>("disabled");
    this.status = this.statusSubject.asObservable();
  }

  public UpdateStatus() {
    this.ble.isEnabled().then(
      () => {
        this.ble.isConnected(this.selectedDevice.id).then(
          () => { this.statusSubject.next("connected"); },
          () => { this.statusSubject.next("disconnected"); }
        );
      },
      () => { this.statusSubject.next("disabled"); })
  }

  getObservableStatus() {
    return this.status;
  }

  public scan(scanningTime: number) {
    this.listSubject.next([]); //empty list
    this.statusSubject.next("scanning");
    //TODO: delete me. test purpose
    setTimeout(() => {
      let mock:BleDevice = this.getMockDevice();
      let advOfMockDevice= {name: mock.name, id: mock.id, advertising: mock.advertising, rssi: mock.rssi };
      this.listSubject.value.push(mock);

      this.listSubject.next(this.listSubject.value);
    }, 2000);

    this.ble.scan([], scanningTime).subscribe(
      dev => this.onDeviceDiscovered(dev),
      error => this.onScanError(error)
    );
    setTimeout(() => { this.statusSubject.next("disconnected"); }, scanningTime*1000);
  }

  stopScan() {
    this.ble.stopScan().then(() => { console.log('scan stopped'); });
  }

  private onDeviceDiscovered(device) {
    this.ngZone.run(() => {
      this.listSubject.value.push(device);  
      this.listSubject.next(this.listSubject.value);
      console.log("BleService: New device discovered");
    });
  }

  private onScanError(error) {
    alert("Scan error:" + error);
  }

  getObservableList(): Observable<BleAdvertisingPacket[]>{
    return this.list;
  }

  getDeviceById(id:string): BleAdvertisingPacket{
    return this.listSubject.value.find(device => device.id === id);
  }

  getSelectedDevice() {
    return this.selectedDevice;
  }

  connect(id: string) {
    this.ble.connect(id).subscribe(
      device => this.onConnected(device),
      error => this.onDisconnected(error)
    ); 
  }
  

  disconnect(id:string) {
    this.ble.disconnect(id).then(
      () => {
        console.log("Disconnection: OK");
        this.statusSubject.next("disconnected");
      },
      () => { console.log("Disconnection: FAIL") }
    );
  }

  onConnected(device) {
    this.statusSubject.next("connected");
    this.selectedDevice = device;    
  }

  async onDisconnected(error) {
    this.statusSubject.next("disconnected");
    const toast = await this.toastCtrl.create({
      message: this.selectedDevice.id+' disconnected',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
    this.selectedDevice = { name: "n/a", id: "n/a", advertising: new ArrayBuffer(0), rssi: 0, services: [], characteristics: [] }
  }

  private getMockDevice(): BleDevice {    
    let mock: BleDevice = this.getEmptyDevice();
    mock.name = "Mock device";
    mock.id = "5f:a4:33:00:ef:b1";
    mock.services = ["Serv 1", "Serv 2", "Serv 3"];
    mock.characteristics = [
      { service: "Serv 1", characteristic: "Serv 1: Char 1", properties: ["indicate"], descriptors: [{"key1":"value1"}] },
      { service: "Serv 2", characteristic: "Serv 2: Char 1", properties: ["notification"], descriptors: [{"key2":"value2"}] },
      { service: "Serv 2", characteristic: "Serv 2: Char 2", properties: ["notification"], descriptors: [{"key3":"value3"}] }
    ]
    return mock;
  }

  private getEmptyDevice(): BleDevice {
    return new BleDevice("n/a", "n/a");
  }

  /* BUG START: Does NOT work  with callback */
  /*
  private onChangeDataCallback: Function

  private onChangeData(data) {
    this.onChangeDataCallback(data);    
  }

  startNotification2(serviceUUID: string, characteristicUUID: string, callback: Function) {
    this.onChangeDataCallback = callback;
    this.ble.startNotification(this.selectedDevice.id, serviceUUID, characteristicUUID).subscribe(
      (data) => { this.onChangeData(data) },
      () => alert('Unexpected Error: Failed to subscribe for data changes'));
  }
  */
/* BUG END */
  
  startNotification(serviceUUID: string, characteristicUUID: string, callback: Function) {
    
    return this.ble.startNotification(this.selectedDevice.id, serviceUUID, characteristicUUID);
      
  } 

  stopNotification(serviceUUID:string, characteristicUUID:string) {
    this.ble.stopNotification(this.selectedDevice.id, serviceUUID, characteristicUUID).then(
      () => alert('stopNotification: OK'),
      () => alert('stopNotification: FAIL')
    )   
  }
}


