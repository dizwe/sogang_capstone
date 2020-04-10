/**
 * BasicHTTPClient.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>
#include <string>
#include <iostream>
using namespace std;

#include <WiFi.h>
#include <WiFiMulti.h>

#include <HTTPClient.h>

#define USE_SERIAL Serial

WiFiMulti wifiMulti;
int seq_num= 1;
#include <OneWire.h>
#include <DallasTemperature.h>
// Data wire is plugged TO GPIO 4
#define ONE_WIRE_BUS 14

// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);

// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);

// Number of temperature devices found
int numberOfDevices;
// We'll use this variable to store a found device address
DeviceAddress tempDeviceAddress; 

void setup() {
    seq_num = 1;

    USE_SERIAL.begin(115200);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    for(uint8_t t = 4; t > 0; t--) {
        USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
        USE_SERIAL.flush();
        delay(1000);
    }
    
    wifiMulti.addAP("KT_GiGA_2G_Wave2_F521", "*****");
    wifiMulti.addAP("KT_GiGA_5G_Wave2_F521", "*****");
    wifiMulti.addAP("Jo의 iPad", "*********");
    wifiMulti.addAP("gamsong", "*****");

     // start serial port
    Serial.begin(115200);
    
    // Start up the library
    sensors.begin();
    
    // Grab a count of devices on the wire
    numberOfDevices = sensors.getDeviceCount();
    
    // locate devices on the bus
    Serial.print("Locating devices...");
    Serial.print("Found ");
    Serial.print(numberOfDevices, DEC); // DECIMAL
    Serial.println(" devices.");
  
    // Loop through each device, print out address
    for(int i=0;i<numberOfDevices; i++){
      // Search the wire for address
      if(sensors.getAddress(tempDeviceAddress, i)){
        Serial.print("Found device ");
        Serial.print(i, DEC);
        Serial.print(" with address: ");
        printAddress(tempDeviceAddress);
        Serial.println();
      } else {
        Serial.print("Found ghost device at ");
        Serial.print(i, DEC);
        Serial.print(" but could not detect address. Check power and cabling");
      }
    }
}

void loop() {
    sensors.requestTemperatures(); // Send the command to get temperatures
    float tempC;
    // Loop through each device, print out temperature data
    for(int i=0;i<numberOfDevices; i++){
      // Search the wire for address
      if(sensors.getAddress(tempDeviceAddress, i)){
        // Output the device ID
        Serial.print("Temperature for device: ");
        Serial.println(i,DEC);
        // Print the data
        tempC = sensors.getTempC(tempDeviceAddress);
        Serial.print("Temp C: ");
        Serial.print(tempC);
        Serial.print(" Temp F: ");
        Serial.println(DallasTemperature::toFahrenheit(tempC)); // Converts tempC to Fahrenheit
      }
    }
    
    // wait for WiFi connection
    if((wifiMulti.run() == WL_CONNECTED)) {
        Serial.print(" Temp F: ");
        HTTPClient http;
        
        USE_SERIAL.print("[HTTP] begin...\n");
        // configure traged server and url
        //http.begin("https://www.howsmyssl.com/a/check", ca); //HTTPS
//        http.begin("https://www.naver.com");

//        http.begin("http://ec2-34-235-96-225.compute-1.amazonaws.com:8000/temp_data?device_id="); //HTTP
        http.begin("http://ec2-34-235-96-225.compute-1.amazonaws.com:8000/temp_log?device_id=0&seq_num="+String(seq_num)+"&temperature_value="+String(tempC)); //HTTP

        USE_SERIAL.print("[HTTP] GET...\n");
        // start connection and send HTTP header
        int httpCode = http.GET();

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == HTTP_CODE_OK) {
                String payload = http.getString();
                USE_SERIAL.println(payload);
            }
        } else {
            USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }

        http.end();
    }else{
      USE_SERIAL.printf("CANNOT CONNECT WIFI");
    } 
    seq_num++;
    delay(60000);
}

// function to print a device address
void printAddress(DeviceAddress deviceAddress) {
  for (uint8_t i = 0; i < 8; i++){
    if (deviceAddress[i] < 16) Serial.print("0");
      Serial.print(deviceAddress[i], HEX);
  }
}