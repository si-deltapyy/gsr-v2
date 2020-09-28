/*
    Video: https://www.youtube.com/watch?v=oCMOYS71NIU
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleNotify.cpp
    Ported to Arduino ESP32 by Evandro Copercini
    updated by chegewara

   Create a BLE server that, once we receive a connection, will send periodic notifications.
   The service advertises itself as: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
   And has a characteristic of: beb5483e-36e1-4688-b7f5-ea07361b26a8

   The design of creating the BLE server is:
   1. Create a BLE Server
   2. Create a BLE Service
   3. Create a BLE Characteristic on the Service
   4. Create a BLE Descriptor on the characteristic
   5. Start the service.
   6. Start advertising.

   A connect hander associated with the server starts a background task that performs notification
   every couple of seconds.
*/
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
uint32_t position = 0;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define SIGNAL_SIZE     613


class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

uint32_t ecg_signal[] = {100,100,100,100,100,101,101,101,102,106,109,113,117,120,124,128,131,133,129,126,122,119,115,111,108,104,101,101,101,101,101,100,100,100,100,100,100,100,92,82,71,92,112,133,154,174,195,178,149,119,90,60,31,31,60,89,100,100,100,100,100,100,100,101,101,101,101,101,101,101,101,101,101,101,101,101,102,102,102,103,105,107,109,110,112,114,116,117,116,115,113,111,109,108,106,104,102,101,101,101,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,101,101,102,106,109,113,117,120,124,128,131,133,129,126,122,119,115,111,108,104,101,101,101,101,101,100,100,100,100,100,100,100,92,82,71,92,112,133,154,174,195,178,149,119,90,60,31,31,60,89,100,100,100,100,100,100,100,101,101,101,101,101,101,101,101,101,101,101,101,101,102,102,102,103,105,107,109,110,112,114,116,117,116,115,113,111,109,108,106,104,102,101,101,101,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,101,101,102,106,109,113,117,120,124,128,131,133,129,126,122,119,115,111,108,104,101,101,101,101,101,100,100,100,100,100,100,100,92,82,71,92,112,133,154,174,195,178,149,119,90,60,31,31,60,89,100,100,100,100,100,100,100,101,101,101,101,101,101,101,101,101,101,101,101,101,102,102,102,103,105,107,109,110,112,114,116,117,116,115,113,111,109,108,106,104,102,101,101,101,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,101,101,102,106,109,113,117,120,124,128,131,133,129,126,122,119,115,111,108,104,101,101,101,101,101,100,100,100,100,100,100,100,92,82,71,92,112,133,154,174,195,178,149,119,90,60,31,31,60,89,100,100,100,100,100,100,100,101,101,101,101,101,101,101,101,101,101,101,101,101,102,102,102,103,105,107,109,110,112,114,116,117,116,115,113,111,109,108,106,104,102,101,101,101,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,101,101,102,106,109,113,117,120,124,128,131,133,129,126,122,119,115,111,108,104,101,101,101,101,101,100,100,100,100,100,100,100,92,82,71,92,112,133,154,174,195,178,149,119,90,60,31,31,60,89,100,100,100,100,100,100,100,101,101,101,101,101,101,101,101,101,101,101,101,101,102,102,102,103,105,107,109,110,112,114,116,117,116,115,113,111,109,108,106,104,102,101,101,101,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100};



void setup() {
  Serial.begin(115200);

  // Create the BLE Device
  BLEDevice::init("ESP32");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY |
                      BLECharacteristic::PROPERTY_INDICATE
                    );

  // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
  // Create a BLE Descriptor
  pCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);  // set index to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}

void loop() {
    // notify changed value
    if (deviceConnected) {
        pCharacteristic->setValue((uint8_t*)(&ecg_signal[position]), 4);
        pCharacteristic->notify();
        position = (position+1)%SIGNAL_SIZE;
        delay(3); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
    }
    // disconnecting
    if (!deviceConnected && oldDeviceConnected) {
        delay(500); // give the bluetooth stack the chance to get things ready
        pServer->startAdvertising(); // restart advertising
        Serial.println("start advertising");
        oldDeviceConnected = deviceConnected;
    }
    // connecting
    if (deviceConnected && !oldDeviceConnected) {
        // do stuff here on connecting
        oldDeviceConnected = deviceConnected;
    }
}
