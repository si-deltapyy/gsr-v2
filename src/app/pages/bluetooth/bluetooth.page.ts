import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BleDevice } from 'src/app/models/BleDevice';
import { BleService } from 'src/app/services/ble.service';

@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.page.html',
  styleUrls: ['./bluetooth.page.scss'],
})
export class BluetoothPage implements OnInit {
  private state = "disabled";
  public devices: BleDevice[] = [];
  constructor(private bleSrv: BleService, private router: Router) {
    this.bleSrv.getObservableList().subscribe({ next: list => { this.devices = list; }})
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
