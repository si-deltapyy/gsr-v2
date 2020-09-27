import { Injectable, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { ThemeService } from 'ng2-charts';
import { BehaviorSubject, Observable } from 'rxjs';
import { BleAdvertisingPacket } from '../models/BleAdvertisingPacket';
import { BleDevice } from '../models/BleDevice';


@Injectable({
  providedIn: 'root'
})
export class BleService {

  private devicesList: BleAdvertisingPacket[];
  private listSubject: BehaviorSubject<BleAdvertisingPacket[]>;
  public readonly list: Observable<BleAdvertisingPacket[]>;

  constructor(private ble: BLE, private ngZone: NgZone) { 
    //this.devicesList = new Array <BleDevice>();
    this.listSubject = new BehaviorSubject <BleAdvertisingPacket[]>([]);
    this.list = this.listSubject.asObservable();
  }

  public async isEnabled(): Promise<void> {
    return this.ble.isEnabled();
  }

  public scan(scanningTime: number) {
    this.listSubject.next([]); //empty list
    //TODO: delete me. test purpose
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        let mockdevice:BleAdvertisingPacket = { name: "Mock Device " + i, id: "5f:a4:33:00:ef:b" + i.toString(), advertising: new ArrayBuffer(0), rssi: -30 + i };
        this.listSubject.value.push(mockdevice);
      }
      this.listSubject.next(this.listSubject.value);
    }, 2000);

    this.ble.scan([], scanningTime).subscribe(
      dev => this.onDeviceDiscovered(dev),
      error => this.onScanError(error)
    );
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

}
