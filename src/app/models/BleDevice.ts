import { BleCharacteristic } from './BleCharacteristic';

export class BleDevice {
  private name: string;
  private id: string;
  private advertising: ArrayBuffer;
  private rssi: number;
  public services: string[];
  public characteristics: BleCharacteristic[];



  constructor(id: string,name: string) {
    this.name = name;
    this.id = id;    
    this.advertising = new ArrayBuffer(0);
    this.rssi = 0;    
    this.services = [];
    this.characteristics = [];
  }

  getId() {
    return this.id;
  }
}