import { logger } from "../logging/logger";

export function Logger_Class<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends (constructor) {
        constructor(...args: any[]) {
            super(...args);
            logger.info(`클래스 ${constructor.name} 인스턴스 생성됨, 인자: ${JSON.stringify(args)}`);
        }
    }
}


export function Logger_Method(target: Object, property_key: string, descriptor: PropertyDescriptor) {
    const origin_method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        logger.info(`메서드 호출: ${property_key}, 인자: ${JSON.stringify(args)} `);
        return origin_method.apply(this, args);
    }
}
