import { Contract } from '@/types/contracts';

export const generateMockContracts = (count: number): Contract[] => {
  return Array(count).fill(null).map((_, index) => ({
    noticeId: `47QTCA23D${String(index).padStart(4, '0')}`,
    title: `Contract ${index + 1} - IT Professional Services Project`,
    solicitationNumber: `SOL-${String(index).padStart(4, '0')}`,
    department: "GENERAL SERVICES ADMINISTRATION",
    subTier: "PUBLIC BUILDINGS SERVICE",
    office: "PBS R5",
    postedDate: "2024-03-15",
    type: "Combined Synopsis/Solicitation",
    baseType: "Award Notice",
    archiveType: "manual",
    archiveDate: null,
    typeOfSetAsideDescription: "Total Small Business Set-Aside",
    typeOfSetAside: "SBA",
    responseDeadLine: "2024-04-15",
    naicsCode: "541519",
    classificationCode: "D",
    active: index % 3 === 0 ? "Yes" : "No",
    award: index % 3 === 0 ? {
      date: "2024-03-15",
      number: `AWARD-${String(index).padStart(4, '0')}`,
      amount: (1000000 + (index * 150000)).toString(),
      awardee: {
        name: "Tech Solutions Inc.",
        location: {
          streetAddress: "123 Tech Street",
          city: {
            code: "53000",
            name: "Washington"
          },
          state: {
            code: "DC"
          },
          zip: "20001",
          country: {
            code: "USA"
          }
        },
        ueiSAM: "025114695AST"
      }
    } : undefined,
    pointOfContact: [{
      fax: null,
      type: "primary",
      email: "contact@gsa.gov",
      phone: "202-555-0000",
      title: "Contracting Officer",
      fullName: "John Smith"
    }],
    description: "Comprehensive IT infrastructure upgrade including network modernization, security enhancement, and ongoing maintenance services.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "20001",
      city: "WASHINGTON",
      countryCode: "USA",
      state: "DC"
    },
    placeOfPerformance: {
      streetAddress: "456 Gov Street",
      city: {
        code: "53000",
        name: "Washington"
      },
      state: {
        code: "DC"
      },
      zip: "20001",
      country: {
        code: "USA"
      }
    },
    additionalInfoLink: null,
    uiLink: `https://beta.sam.gov/opp/${String(index).padStart(4, '0')}/view`,
    links: [{
      rel: "self",
      href: `https://api.sam.gov/prod/opportunities/v1/search?noticeid=${String(index).padStart(4, '0')}`,
      hreflang: null,
      media: null,
      title: null,
      type: null,
      deprecation: null
    }]
  }));
};