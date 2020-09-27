export interface BleAdvertisingPacket{
  name: string;
  id: string;
  advertising: ArrayBuffer;
  rssi: number;
}