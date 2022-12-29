// 
import { log } from 'console';
import configuration from 'src/config/configuration';
export function getEnvironment(): string {
    try {
        return configuration().ENVIRONMENT;
    } catch (error) {
        log(error);
        return error;
    }
}

