import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

export class SerializableReflector extends Reflector {
    constructor(geometry, options = {}) {
        super(geometry, options);
        this.userData.isReflector = true;
        this.userData.reflectorOptions = options;
        this.userData.geometryParams = {
                width: geometry.parameters.width,
                height: geometry.parameters.height
            };
        }

    toJSON(meta) {
        const data = super.toJSON(meta);
        data.object.userData = this.userData; // keep reflector flags + options
        return data;
    }

    static fromJSON(data) {
        if (data.userData?.isReflector) {
            const { width, height } = data.userData.geometryParams || { width: 10, height: 10 };
            const geometry = new THREE.PlaneGeometry(width, height);
            return new SerializableReflector(geometry, data.userData.reflectorOptions);
        }
        return null;
    }
}
