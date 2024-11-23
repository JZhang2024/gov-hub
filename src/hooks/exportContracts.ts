import { 
    ExportFields, 
    ExportErrorType,
    ExportErrorDetails,
    ExportContractsOptions
} from '@/types/contracts';
import { useState } from 'react';

class ContractExportError extends Error {
    constructor(
        message: string,
        public code: ExportErrorType,
        public details?: any
    ) {
        super(message);
        this.name = 'ContractExportError';
    }
}

export async function exportContracts(options: ExportContractsOptions): Promise<void> {
    try {
        const response = await fetch('/api/export-contracts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new ContractExportError(
                errorData.error || 'Export failed',
                'NETWORK_ERROR',
                errorData.details
            );
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `contracts-export.${options.format}`;

        // Convert response to blob
        const blob = await response.blob();

        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Export error:', error);
        
        if (error instanceof ContractExportError) {
            throw error;
        }

        throw new ContractExportError(
            'Failed to export contracts',
            'NETWORK_ERROR',
            error instanceof Error ? error.message : 'Unknown error'
        );
    }
}

// Helper function to use with React components
export function useContractExport() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<ExportErrorDetails | null>(null);

    const handleExport = async (options: ExportContractsOptions) => {
        setIsExporting(true);
        setExportError(null);

        try {
            await exportContracts(options);
        } catch (error) {
            setExportError(
                error instanceof ContractExportError
                    ? {
                            code: error.code,
                            message: error.message,
                            details: error.details
                        }
                    : {
                            code: 'NETWORK_ERROR',
                            message: 'An unexpected error occurred',
                            details: error instanceof Error ? error.message : 'Unknown error'
                        }
            );
            throw error;
        } finally {
            setIsExporting(false);
        }
    };

    return {
        handleExport,
        isExporting,
        exportError,
        clearExportError: () => setExportError(null)
    };
}

// Utility function to validate export options
export function validateExportOptions(options: ExportContractsOptions): string[] {
    const errors: string[] = [];

    if (!options.format) {
        errors.push('Export format is required');
    }

    if (!options.scope) {
        errors.push('Export scope is required');
    }

    if (!options.selectedFields || Object.values(options.selectedFields).every(v => !v)) {
        errors.push('At least one field must be selected for export');
    }

    if (options.scope === 'current' && (!options.page || !options.pageSize)) {
        errors.push('Page and page size are required for current page exports');
    }

    return errors;
}

// Utility function to estimate export size
export function estimateExportSize(
    totalRecords: number, 
    selectedFields: ExportFields
): { size: number; warning?: string } {
    // Rough estimate of bytes per record based on selected fields
    const bytesPerRecord = Object.entries(selectedFields).reduce((total, [field, isSelected]) => {
        if (!isSelected) return total;
        
        // Rough estimates for each field type
        const fieldSizes = {
            basic: 200,
            contacts: 300,
            addresses: 250,
            awards: 400,
            setAside: 150,
            dates: 100,
            links: 500
        };
        
        return total + fieldSizes[field as keyof ExportFields];
    }, 0);

    const totalSize = bytesPerRecord * totalRecords;
    const sizeInMB = totalSize / (1024 * 1024);

    return {
        size: sizeInMB,
        warning: sizeInMB > 10 ? 'Large export size may take longer to process' : undefined
    };
}