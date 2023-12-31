import {
    AccessoryConfig,
    AccessoryPlugin,
    API,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    HAP,
    Logging,
    Service
} from "homebridge";

import { SerialPort } from 'serialport';
import Readline from '@serialport/parser-readline';
import { ReadlineParser } from 'serialport';
/*
 * IMPORTANT NOTICE
 *
 * One thing you need to take care of is, that you never ever ever import anything directly from the "homebridge" module (or the "hap-nodejs" module).
 * The above import block may seem like, that we do exactly that, but actually those imports are only used for types and interfaces
 * and will disappear once the code is compiled to Javascript.
 * In fact you can check that by running `npm run build` and opening the compiled Javascript file in the `dist` folder.
 * You will notice that the file does not contain a `... = require("homebridge");` statement anywhere in the code.
 *
 * The contents of the above import statement MUST ONLY be used for type annotation or accessing things like CONST ENUMS,
 * which is a special case as they get replaced by the actual value and do not remain as a reference in the compiled code.
 * Meaning normal enums are bad, const enums can be used.
 *
 * You MUST NOT import anything else which remains as a reference in the code, as this will result in
 * a `... = require("homebridge");` to be compiled into the final Javascript code.
 * This typically leads to unexpected behavior at runtime, as in many cases it won't be able to find the module
 * or will import another instance of homebridge causing collisions.
 *
 * To mitigate this the {@link API | Homebridge API} exposes the whole suite of HAP-NodeJS inside the `hap` property
 * of the api object, which can be acquired for example in the initializer function. This reference can be stored
 * like this for example and used to access all exported variables and classes from HAP-NodeJS.
 */
let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
    hap = api.hap;
    api.registerAccessory("SerialPortMotionSensorAccessory", SerialPortMotionSensorAccessory);
};

class SerialPortMotionSensorAccessory implements AccessoryPlugin {

    private readonly log: Logging;
    private readonly name: string;

    config: AccessoryConfig;
    api: API;
    Service: any;
    Characteristic: any;
    service: any;
    // service: any;
    // Service: any;
    currentValue: boolean = false;
    port: any;
    serialPortName: string = "";

    constructor(log: Logging, config: AccessoryConfig, api: API) {
        this.log = log;
        this.config = config;
        this.api = api;

        this.Service = this.api.hap.Service;

        this.name = config.name;

        this.serialPortName = config.serialPort;

        this.service = new this.Service(this.Service.MotionSensor);

        this.service.getCharacteristic(this.Characteristic.MotionDetected)
            .onGet(this.handleMotionDetectedGet.bind(this))

        this.port = new SerialPort({ path: this.serialPortName, baudRate: 115200 })
        const parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
        parser.on('data', (data: any) => {
            if (data == "1") {
                this.currentValue = true;
            }
            else {
                this.currentValue = false;
            }
        })


    }

    getServices(): Service[] {
        return [
            this.service
        ];
    }
    /**
   * Handle requests to get the current value of the "Motion Detected" characteristic
   */
    handleMotionDetectedGet() {
        this.log.debug('Triggered GET MotionDetected');

        return this.currentValue;
    }
}
