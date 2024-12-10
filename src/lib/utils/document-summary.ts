export async function summarizeDocuments(
    documents: Array<{ url: string; noticeId: string }>
): Promise<Array<{ url: string; summary: string | null }>> {
    try {
        // Process all documents in parallel
        console.log("Starting documents processing");
        const summaryPromises = documents.map(async ({ url, noticeId }) => {
            try {
                const proxyUrl = `/api/proxy-download?${new URLSearchParams({
                    url,
                    noticeId,
                })}`;

                const response = await fetch(proxyUrl);
                if (!response.ok) {
                    console.error(`Failed to fetch document: ${url}`);
                    return { url, summary: null };
                }

                // Check both content type and filename for PDF
                const contentType = response.headers.get('content-type');
                const contentDisposition = response.headers.get('content-disposition');
                const fileName = contentDisposition
                    ? contentDisposition.split('filename=')[1]?.replace(/["']/g, '')
                    : '';

                const isPdf =
                    contentType === 'application/pdf' ||
                    fileName.toLowerCase().endsWith('.pdf');

                if (!isPdf) {
                    console.log(
                        `Document type ${contentType} (${fileName}) not yet supported for AI analysis: ${url}`
                    );
                    return { url, summary: null };
                }

                const blob = await response.blob();
                const base64Content = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = reader.result as string;
                        resolve(base64.split(',')[1]);
                    };
                    reader.readAsDataURL(blob);
                });

                const summaryResponse = await fetch('/api/summarize-document', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: base64Content,
                        contentType: 'application/pdf',
                    }),
                });

                if (!summaryResponse.ok) {
                    console.error(`Failed to summarize document: ${url}`);
                    return { url, summary: null };
                }

                const { summary } = await summaryResponse.json();
                return { url, summary };
            } catch (error) {
                console.error(`Error processing document ${url}:`, error);
                return { url, summary: null };
            }
        });

        // Wait for all summaries to complete
        return await Promise.all(summaryPromises);
    } catch (error) {
        console.error('Document summary error:', error);
        throw error;
    }
}