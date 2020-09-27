import { BleAdvertisingPacket } from './BleAdvertisingPacket';
import { BleCharacteristic } from './BleCharacteristic';

export class BleDevice implements BleAdvertisingPacket {
  name: string;
  id: string;
  advertising: ArrayBuffer;
  rssi: number;
  services: string[];
  characteristics: BleCharacteristic[];



  constructor(id: string,name: string) {
    this.name = name;
    this.id = id;    
    this.advertising = new ArrayBuffer(0);
    this.rssi = 0;    
    this.services = [];
    this.characteristics = [];
  }
}