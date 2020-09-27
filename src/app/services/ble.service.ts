import { Injectable, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { ThemeService } from 'ng2-charts';
import { BehaviorSubject, Observable } from 'rxjs';
import { BleDevice } from '../models/BleDevice';


@Injectable({
  providedIn: 'root'
})
export class BleService {

  private devicesList: BleDevice[];
  private listSubject: BehaviorSubject<BleDevice[]>;
  public readonly list: Observable<BleDevice[]>;

  constructor(private ble: BLE, private ngZone: NgZone) { 
    //this.devicesList = new Array <BleDevice>();
    this.listSubject = new BehaviorSubject <BleDevice[]>([]);
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
        let mockdevice = new BleDevice("5f:a4:33:00:ef:b" + i.toString(), "Mock Device ");
        this.listSubject.value.push(mockdevice);
      }
      this.listSubject.next(this.listSubject.value);
    }, 2000);

    this.ble.scan([], scanningTime).subscribe(
      (dev) => this.onDeviceDiscovered(dev),
      error => this.onScanError(error)
    );
  }

  private onDeviceDiscovered(device) {
    this.ngZone.run(() => {
      this.listSubject.value.push(device);  
      this.listSubject.next(this.listSubject.value);
      console.log('Discovered: ')
    });
  }

  private onScanError(error) {
    alert("Scan error:" + error);
  }

  getObservableList(): Observable<BleDevice[]>{
    return this.list;
  }

  getDeviceById(id:string): BleDevice {
    return this.listSubject.value.find(device => device.getId()== id);
  }

}
