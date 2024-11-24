import { ExportErrorType } from '@/types/contracts';

export default class ContractExportError extends Error {
    constructor(
        message: string,
        public code: ExportErrorType,
        public details?: any
    ) {
        super(message);
        this.name = 'ContractExportError';
    }
}