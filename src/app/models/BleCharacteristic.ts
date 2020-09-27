export class BleCharacteristic{
  service: string;
  characteristic: string;
  properties: string[]; 
  descriptors: Record<string, string>[];
  
  constructor() {
    this.service = "";
    this.characteristic = "";
    this.properties = [];
    this.descriptors = [];
  }
}