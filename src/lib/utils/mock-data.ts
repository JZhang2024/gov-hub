import { Contract } from '@/types/contracts';

// Sample titles and departments for variety
const sampleTitles = [
  "DIESEL ENGINES",
  "Runway Rubber Removal",
  "Carnival Ride",
  "Historic Office Renovation",
  "IT Infrastructure Upgrade"
];

const departments = [
  {
    fullName: "DEPT OF DEFENSE.DEPT OF THE AIR FORCE.AETC.JBSA - LACKLAND (JOINT BASE SAN ANTONIO).FA3047  802 CONS CC JBSA",
    code: "057.5700.AETC.JBSA - LACKLAND (JOINT BASE SAN ANTONIO).FA3047"
  },
  {
    fullName: "GENERAL SERVICES ADMINISTRATION.PUBLIC BUILDINGS SERVICE.PBS R5",
    code: "047.PBS.R5"
  }
];

const samplePOCs = [
  {
    fax: "2108675309",
    type: "primary",
    email: "brenda.rodriguez.3@us.af.mil",
    phone: "2108675309",
    title: null,
    fullName: "SSgt Brenda Rodriguez"
  },
  {
    fax: null,
    type: "primary",
    email: "jesse.jones@gsa.gov",
    phone: "2174941263",
    title: "Contracting Officer",
    fullName: "Jesse L. Jones"
  }
];

export const generateMockContracts = (count: number): Contract[] => {
  return Array(count).fill(null).map((_, index) => {
    const deptIndex = index % departments.length;
    const isAirForce = deptIndex === 0;
    
    // Use deterministic IDs based on index
    const noticeId = isAirForce ? 
      `f8941f369ab${index.toString().padStart(8, '0')}` :
      `5b345bbb712${index.toString().padStart(8, '0')}`;

    // Use deterministic solicitation numbers
    const solNum = isAirForce ? 
      `RODRIGUEZ${index.toString().padStart(2, '0')}-FATS1278236DE${index}-DE` :
      `47PF2024R${index.toString().padStart(4, '0')}`;

    const hasAward = index % 5 === 0; // 20% of contracts have awards

    return {
      noticeId,
      title: sampleTitles[index % sampleTitles.length],
      solicitationNumber: solNum,
      fullParentPathName: departments[deptIndex].fullName,
      fullParentPathCode: departments[deptIndex].code,
      postedDate: "2024-09-19",
      type: index % 2 === 0 ? "Combined Synopsis/Solicitation" : "Solicitation",
      baseType: index % 2 === 0 ? "Combined Synopsis/Solicitation" : "Presolicitation",
      archiveType: "autocustom",
      archiveDate: "2024-10-29",
      typeOfSetAsideDescription: "Total Small Business Set-Aside (FAR 19.5)",
      typeOfSetAside: "SBA",
      responseDeadLine: "2024-09-23T13:30:00-05:00",
      naicsCode: isAirForce ? "333618" : "236220",
      naicsCodes: isAirForce ? ["333618"] : ["236220"],
      classificationCode: isAirForce ? "2815" : "Z",
      active: "Yes",
      award: hasAward ? {
        date: "2024-05-04",
        number: `47PF2024C${index.toString().padStart(4, '0')}`,
        amount: (800000 + (index * 50000)).toString(),
        awardee: {
          name: "D.G. Beyer, Inc.",
          location: {
            streetAddress: "3080 S Calhoun Rd.",
            city: {
              code: "56375",
              name: "New Berlin"
            },
            state: {
              code: "WI"
            },
            zip: "53151",
            country: {
              code: "USA"
            }
          },
          ueiSAM: "025114695AST"
        }
      } : null,
      pointOfContact: [
        {...samplePOCs[deptIndex]},
        {
          ...samplePOCs[(deptIndex + 1) % samplePOCs.length],
          type: "secondary"
        }
      ],
      description: `https://api-alpha.sam.gov/prodlike/opportunities/v1/noticedesc?noticeid=${noticeId}`,
      organizationType: "OFFICE",
      officeAddress: isAirForce ? {
        zipcode: "78236-5286",
        city: "JBSA LACKLAND",
        countryCode: "USA",
        state: "TX"
      } : {
        zipcode: "60604",
        city: "CHICAGO",
        countryCode: "USA",
        state: "IL"
      },
      placeOfPerformance: {
        city: {
          code: "0",
          name: isAirForce ? "Heartland" : "Milwaukee"
        },
        state: {
          code: isAirForce ? "TX" : "WI",
          name: isAirForce ? "Texas" : "Wisconsin"
        },
        zip: isAirForce ? "78236" : "53202",
        country: {
          code: "USA",
          name: "UNITED STATES"
        }
      },
      additionalInfoLink: null,
      uiLink: `https://alpha.sam.gov/opp/${noticeId}/view`,
      links: [{
        rel: "self",
        href: `https://api-alpha.sam.gov/prodlike/opportunities/v2/search?noticeid=${noticeId}&limit=1`,
        hreflang: null,
        media: null,
        title: null,
        type: null,
        deprecation: null
      }],
      resourceLinks: [
        `https://alpha.sam.gov/api/prodlike/opps/v3/opportunities/resources/files/resource${index.toString().padStart(4, '0')}/download`
      ]
    };
  });
};