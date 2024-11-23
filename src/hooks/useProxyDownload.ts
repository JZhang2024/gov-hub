import { useState } from 'react';

interface UseProxyDownloadProps {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const useProxyDownload = ({ onError, onSuccess }: UseProxyDownloadProps = {}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = async (fileUrl: string, noticeId: string) => {
    setIsDownloading(true);

    try {
      // Create the proxy URL. Set to localhost for development
      const proxyUrl = `/api/proxy-download?${new URLSearchParams({
        url: fileUrl,
        noticeId,
      })}`;

      // Fetch the file through our proxy
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/["']/g, '')
        : 'document.pdf';

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onSuccess?.();
    } catch (error) {
      console.error('Download error:', error);
      onError?.(error as Error);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadFile,
    isDownloading,
  };
};