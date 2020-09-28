import { Component, OnInit } from '@angular/core';
import { BleDevice } from 'src/app/models/BleDevice';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {
  private device: BleDevice;

  constructor(private bleSrv: BleService) {
    this.device = this.bleSrv.getSelectedDevice();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.device = this.bleSrv.getSelectedDevice();
  }
}
