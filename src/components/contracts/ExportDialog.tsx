import React, { useState } from 'react';
import { FileDown, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Contract, 
  ExportDialogProps, 
  ExportFormat, 
  ExportFields,
  ExportContractsOptions
} from '@/types/contracts';
import { useContractExport, validateExportOptions, estimateExportSize } from '@/lib/api/export-contracts';

const ExportDialog = ({ 
  open, 
  onClose, 
  contracts,
  totalCount,
  currentFilters,
  currentPage = 1,
  pageSize = 25
}: ExportDialogProps) => {
  const { handleExport, isExporting, exportError, clearExportError } = useContractExport();
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [scope, setScope] = useState<'current' | 'all'>('current');
  const [fields, setFields] = useState<ExportFields>({
    basic: true,
    contacts: true,
    addresses: true,
    awards: true,
    setAside: true,
    dates: true,
    links: false
  });

  // Check export size and get warning if needed
  const { warning: sizeWarning } = estimateExportSize(
    scope === 'current' ? contracts.length : totalCount,
    fields
  );

  const onExport = async () => {
    // Clear any previous errors
    clearExportError();

    // Prepare export options
    const exportOptions: ExportContractsOptions = {
      format,
      scope,
      selectedFields: fields,
      filters: currentFilters,
      ...(scope === 'current' && {
        page: currentPage,
        pageSize: pageSize
      })
    };

    const validationErrors = validateExportOptions(exportOptions);
    if (validationErrors.length > 0) {
      // Could use a toast or alert component here
      console.error('Validation errors:', validationErrors);
      return;
    }

    try {
      await handleExport(exportOptions);
      onClose();
    } catch (error) {
      // Error is already handled by the hook
      console.error('Export failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Export Contracts</DialogTitle>
        <DialogDescription>
        Choose your export format and select which information to include in your export file.
        {sizeWarning && (
          <p className="text-amber-600 mt-2">
          {sizeWarning}
          </p>
        )}
        </DialogDescription>
      </DialogHeader>

        {exportError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {exportError.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">Excel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Export Scope</Label>
            <RadioGroup
              value={scope}
              onValueChange={(value) => setScope(value as 'current' | 'all')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current">Current Page ({contracts.length} records)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All Results ({totalCount} records)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Include Fields</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="basic"
                  checked={fields.basic}
                  onCheckedChange={(checked) => 
                    setFields(prev => ({ ...prev, basic: checked as boolean }))
                  }
                />
                <Label htmlFor="basic">Basic Info</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contacts"
                  checked={fields.contacts}
                  onCheckedChange={(checked) => 
                    setFields(prev => ({ ...prev, contacts: checked as boolean }))
                  }
                />
                <Label htmlFor="contacts">Contacts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addresses"
                  checked={fields.addresses}
                  onCheckedChange={(checked) => 
                    setFields(prev => ({ ...prev, addresses: checked as boolean }))
                  }
                />
                <Label htmlFor="addresses">Addresses</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="awards"
                  checked={fields.awards}
                  onCheckedChange={(checked) => 
                    setFields(prev => ({ ...prev, awards: checked as boolean }))
                  }
                />
                <Label htmlFor="awards">Award Info</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="setAside"
                  checked={fields.setAside}
                  onCheckedChange={(checked) => 
                    setFields(prev => ({ ...prev, setAside: checked as boolean }))
                  }
                />
                <Label htmlFor="setAside">Set-Aside Info</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dates"
                  checked={fields.dates}
                  onCheckedChange={(checked) => 
                    setFields(prev => ({ ...prev, dates: checked as boolean }))
                  }
                />
                <Label htmlFor="dates">Dates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="links"
                  checked={fields.links}
                  onCheckedChange={(checked) => 
                    setFields(prev => ({ ...prev, links: checked as boolean }))
                  }
                />
                <Label htmlFor="links">Links</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onExport} 
            disabled={isExporting || Object.values(fields).every(v => !v)}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;