import { createClient } from '@/lib/utils/supabase/client';
import { DocumentProcessingResult } from '@/types/assistant-types';

const supabase = createClient();

export async function summarizeDocuments(
    documents: Array<{ url: string; noticeId: string }>,
    onProgress?: (processed: number, status: DocumentProcessingResult) => void
  ): Promise<Array<DocumentProcessingResult>> {
    try {
      const summaryPromises = documents.map(async ({ url, noticeId }, index) => {
        try {
          // Check cache first
          const { data: cached } = await supabase
            .from('contract_document_summaries')
            .select('content, summary')
            .eq('document_url', url)
            .eq('contract_id', noticeId)
            .single();
  
          if (cached?.summary) {
            console.log(`Using cached summary for ${url}`);
            const result: DocumentProcessingResult = { 
              url, 
              summary: cached.summary,
              status: 'success'
            };
            onProgress?.(index + 1, result);
            return result;
          }
          
          console.log(`Cache miss for ${url}`);
          const proxyUrl = `/api/proxy-download?${new URLSearchParams({
            url,
            noticeId,
          })}`;
  
          const response = await fetch(proxyUrl);
          if (!response.ok) {
            const result: DocumentProcessingResult = { 
              url, 
              summary: null,
              status: 'error',
              message: 'Failed to fetch document'
            };
            onProgress?.(index + 1, result);
            return result;
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
            const result: DocumentProcessingResult = { 
              url, 
              summary: null,
              status: 'unsupported',
              message: `Document type ${contentType || fileName} not yet supported for AI analysis`
            };
            onProgress?.(index + 1, result);
            return result;
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
  
          const summaryResponse = await fetch('/api/summarize-doc-anthropic', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: base64Content,
              contentType: 'application/pdf'
            }),
          });
  
          if (!summaryResponse.ok) {
            const result: DocumentProcessingResult = { 
              url, 
              summary: null,
              status: 'error',
              message: 'Failed to generate summary'
            };
            onProgress?.(index + 1, result);
            return result;
          }
  
          const { summary } = await summaryResponse.json();
  
          // Cache the results
          await supabase.from('contract_document_summaries').upsert({
            contract_id: noticeId,
            document_url: url,
            content: base64Content,
            summary
          });
  
          const result: DocumentProcessingResult = { 
            url, 
            summary, 
            status: 'success' 
          };
          onProgress?.(index + 1, result);
          return result;
  
        } catch (error) {
          const result: DocumentProcessingResult = { 
            url, 
            summary: null,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
          onProgress?.(index + 1, result);
          return result;
        }
      });
  
      return await Promise.all(summaryPromises);
  
    } catch (error) {
      console.error('Document summary error:', error);
      throw error;
    }
  }