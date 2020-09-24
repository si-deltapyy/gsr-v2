import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.page.html',
  styleUrls: ['./bluetooth.page.scss'],
})
export class BluetoothPage implements OnInit {
  private state = "disabled";
  public devices: any[] = [
    { name: "Mock Device 1", id: "5f:a4:33:00:ef:b1", rssi: -37 },
    { name: "Mock Device 2", id: "5f:a5:33:11:ef:b1", rssi: -20 }
  ];
  constructor() { }

  ngOnInit() {
  }

}
