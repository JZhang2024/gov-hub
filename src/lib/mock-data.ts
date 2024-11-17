import { Contract } from '@/types/contracts';

export const generateMockContracts = (count: number): Contract[] => {
  return Array(count).fill(null).map((_, index) => ({
    id: `47QTCA23D${String(index).padStart(4, '0')}`,
    title: `Contract ${index + 1} - IT Professional Services Project`,
    agency: "General Services Administration",
    value: `$${(1000000 + (index * 150000)).toLocaleString()}`,
    posted: "2024-03-15",
    deadline: "2024-04-15",
    status: index % 3 === 0 ? "Active" : "Pending",
    type: "RFP",
    setAside: "Small Business",
    description: "Comprehensive IT infrastructure upgrade including network modernization, security enhancement, and ongoing maintenance services."
  }));
};