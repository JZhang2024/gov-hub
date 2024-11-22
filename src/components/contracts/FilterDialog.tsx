import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { 
  SearchFilters, 
  ContractType, 
  SetAsideType, 
  ContractStatus 
} from '@/types/contracts';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  initialFilters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

interface SetAsideOption {
  code: SetAsideType;
  label: string;
}

const contractTypes: ContractType[] = [
  'Solicitation',
  'Award Notice',
  'Justification',
  'Intent to Bundle',
  'Pre-Solicitation',
  'Combined Synopsis/Solicitation',
  'Sale of Surplus Property',
  'Fair Opportunity / Limited Sources Justification',
  'Foreign Government Standard',
  'Special Notice',
  'Sources Sought'
];

const setAsideTypes: SetAsideOption[] = [
  { code: 'SBA', label: 'Total Small Business Set-Aside' },
  { code: 'SBP', label: 'Partial Small Business Set-Aside' },
  { code: '8A', label: '8(a) Set-Aside' },
  { code: '8AN', label: '8(a) Sole Source' },
  { code: 'HZC', label: 'HUBZone Set-Aside' },
  { code: 'HZS', label: 'HUBZone Sole Source' },
  { code: 'SDVOSBC', label: 'Service-Disabled Veteran-Owned Small Business Set-Aside' },
  { code: 'SDVOSBS', label: 'Service-Disabled Veteran-Owned Small Business Sole Source' },
  { code: 'WOSB', label: 'Women-Owned Small Business Program Set-Aside' },
  { code: 'WOSBSS', label: 'Women-Owned Small Business Program Sole Source' },
  { code: 'EDWOSB', label: 'Economically Disadvantaged WOSB Program Set-Aside' },
  { code: 'EDWOSBSS', label: 'Economically Disadvantaged WOSB Program Sole Source' },
  { code: 'LAS', label: 'Local Area Set-Aside' },
  { code: 'IEE', label: 'Indian Economic Enterprise Set-Aside' },
  { code: 'ISBEE', label: 'Indian Small Business Economic Enterprise Set-Aside' },
  { code: 'BICiv', label: 'Buy Indian Set-Aside' },
  { code: 'VSA', label: 'Veteran-Owned Small Business Set-Aside' },
  { code: 'VSS', label: 'Veteran-Owned Small Business Sole Source' }
];

const statusOptions: ContractStatus[] = [
  'Active',
  'Archived',
  'Awarded'
];

const FilterDialog = ({ 
  open, 
  onClose, 
  initialFilters, 
  onApplyFilters, 
  isLoading 
}: FilterDialogProps) => {
  const form = useForm<SearchFilters>({
    defaultValues: initialFilters
  });
  
  const [selectedTypes, setSelectedTypes] = useState<ContractType[]>(
    initialFilters.type || []
  );
  
  const [selectedSetAsides, setSelectedSetAsides] = useState<SetAsideType[]>(
    initialFilters.setAside || []
  );

  const [selectedStatuses, setSelectedStatuses] = useState<ContractStatus[]>(
    initialFilters.status || []
  );

  const handleTypeToggle = (type: ContractType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSetAsideToggle = (type: SetAsideType) => {
    setSelectedSetAsides(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleStatusToggle = (status: ContractStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const formatDateForInput = (date: string | undefined) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const handleApply = () => {
    const dateRange = form.getValues('dateRange');
    const valueRange = form.getValues('valueRange');

    const filters: SearchFilters = {
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      setAside: selectedSetAsides.length > 0 ? selectedSetAsides : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      dateRange: (dateRange?.start || dateRange?.end) ? {
        start: dateRange.start || '',
        end: dateRange.end || ''
      } : undefined,
      valueRange: (valueRange?.min || valueRange?.max) ? {
        min: valueRange.min,
        max: valueRange.max
      } : undefined
    };
    
    onApplyFilters(filters);
    onClose();
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedSetAsides([]);
    setSelectedStatuses([]);
    form.reset({
      dateRange: { start: '', end: '' },
      valueRange: { min: undefined, max: undefined }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Filter Contracts</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <div className="grid gap-6 py-4">
            {/* Contract Types */}
            <div className="space-y-4">
              <FormLabel>Contract Types</FormLabel>
              <div className="flex flex-wrap gap-2">
                {contractTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTypeToggle(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-4">
              <FormLabel>Status</FormLabel>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Badge
                    key={status}
                    variant={selectedStatuses.includes(status) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleStatusToggle(status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Set-Aside Types */}
            <div className="space-y-4">
              <FormLabel>Set-Aside Types</FormLabel>
              <div className="flex flex-wrap gap-2">
                {setAsideTypes.map((type) => (
                  <Badge
                    key={type.code}
                    variant={selectedSetAsides.includes(type.code) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSetAsideToggle(type.code)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Date Range */}
            <div>
              <FormLabel>Date Range</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="dateRange.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          type="date"
                          {...field}
                          value={formatDateForInput(field.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateRange.end"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          type="date"
                          {...field}
                          value={formatDateForInput(field.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Value Range */}
            <div>
              <FormLabel>Value Range</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="valueRange.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          type="number"
                          placeholder="Min value"
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valueRange.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          type="number"
                          placeholder="Max value"
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </Form>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            disabled={isLoading}
          >
            Clear Filters
          </Button>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Applying...
                </span>
              ) : (
                'Apply Filters'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;