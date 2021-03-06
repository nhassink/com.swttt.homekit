const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;
const debounce = require('lodash.debounce');

module.exports = function(device, api) {

  // Init device
  var homekitAccessory = new Accessory(device.name, device.id);

  // Set device info
  homekitAccessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, device.driver.owner_name)
    .setCharacteristic(Characteristic.Model, device.name + '(' + device.zone.name + ')')
    .setCharacteristic(Characteristic.SerialNumber, device.id);

  // Device identify when added
  homekitAccessory.on('identify', function(paired, callback) {
    console.log(device.name + ' identify');
    callback();
  });

  // Add services and characteristics
  // Onoff
  homekitAccessory
    .addService(Service.Outlet, device.name)
    .getCharacteristic(Characteristic.On)
    .on('set', function(value, callback) {
      device.setCapabilityValue("onoff", value)
      callback();
    })
    .on('get', function(callback) {
      callback(null, device.state.onoff);
    });

  // OutletInUse
  homekitAccessory
    .getService(Service.Outlet)
    .getCharacteristic(Characteristic.OutletInUse)
    .on('get', function(callback) {
      callback(null, true);
    });

  // On realtime event update the device
  device.on('$state', debounce(state => {

    console.log('Realtime update from: ' + device.name)

    homekitAccessory
      .getService(Service.Outlet)
      .getCharacteristic(Characteristic.On)
      .updateValue(state.onoff);

  }));

  // Return device to app.js
  return homekitAccessory
}
