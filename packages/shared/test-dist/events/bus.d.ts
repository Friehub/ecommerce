import { Queue } from 'bullmq';
import { EventType } from './types';
export declare const systemQueue: Queue<any, any, string, any, any, string>;
export declare const notificationQueue: Queue<any, any, string, any, any, string>;
export declare function publishEvent<T>(type: EventType, payload: T, metadata?: Record<string, any>): Promise<string>;
