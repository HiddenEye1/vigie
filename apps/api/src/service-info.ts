import { API_VERSION, APP_NAME } from '@vigie/shared';

export interface ServiceInfo {
  readonly name: string;
  readonly apiVersion: string;
}

export function getServiceInfo(): ServiceInfo {
  return { name: APP_NAME, apiVersion: API_VERSION };
}
