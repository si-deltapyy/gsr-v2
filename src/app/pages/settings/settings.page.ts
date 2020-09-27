import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BleAdvertisingPacket } from 'src/app/models/BleAdvertisingPacket';
import { BleDevice } from 'src/app/models/BleDevice';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  private device: BleAdvertisingPacket;
  private services: string[];
  
  constructor(private bleSrv: BleService, private route: ActivatedRoute) {
    this.initDevice();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    let foundDevice = this.bleSrv.getDeviceById(id)
    if (foundDevice) {
      this.device = foundDevice;
    } else {
      this.initDevice();
    }
  }

  private initDevice() {
    this.device = new BleDevice("n/a", " n/a"); //FIXME: ok?
    /*
    this.device.services = ["mock service 1", "mock service 2", "mock service 3"];
    this.device.characteristics = [
      { service: "mock serv 1", characteristic: "char 1", properties: ["indicate"], descriptors: [{"key1":"value1"}] },
      { service: "mock serv 2",characteristic: "char 2", properties: ["notification"], descriptors: [{"key2":"value2"}] },
      { service: "mock serv 2", characteristic: "char 3", properties: ["notification"], descriptors: [{"key3":"value3"}] }
    ]
    */
  }
}
