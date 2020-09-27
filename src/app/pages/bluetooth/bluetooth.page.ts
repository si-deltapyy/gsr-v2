import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.page.html',
  styleUrls: ['./bluetooth.page.scss'],
})
export class BluetoothPage implements OnInit {
  private state = "disabled";
  public devices = {};
  constructor(private bleSrv: BleService, private router: Router) {
    this.devices = this.bleSrv.getObservableList();
  }

  ngOnInit() {
  }

  scan() {
    this.bleSrv.scan(20);
  }

  onDeviceSelected(device) {
    this.router.navigate(['/settings',device.id]);
  }
}
