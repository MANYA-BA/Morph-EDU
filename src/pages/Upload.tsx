import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Image, FileAudio, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Layout } from '@/components/layout/Layout';
import { useContent } from '@/contexts/ContentContext';
import { useToast } from '@/hooks/use-toast';
import { extractContent } from '@/lib/extraction';
import type { ContentSourceType, RawExtractedContent } from '@/types/content';

const acceptedFormats = [
  { type: 'pdf' as ContentSourceType, label: 'PDF', icon: FileText, accept: '.pdf' },
  { type: 'image' as ContentSourceType, label: 'Image', icon: Image, accept: '.png,.jpg,.jpeg,.webp,.gif,.bmp' },
  { type: 'text' as ContentSourceType, label: 'Text', icon: FileText, accept: '.txt,.md' },
  { type: 'transcript' as ContentSourceType, label: 'Transcript', icon: FileAudio, accept: '.vtt,.srt' },
];

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadState, processContent, resetContent, setUploadProgress, setUploadError } = useContent();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<string>('');
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleFile = useCallback(async (file: File) => {
    setSelectedFile(file);
    setExtractionStatus('Starting extraction...');
    setUploadProgress(5);
    
    try {
      // REAL CONTENT EXTRACTION - not metadata!
      const extractionResult = await extractContent(file, {
        onProgress: (progress, status) => {
          setUploadProgress(progress);
          setExtractionStatus(status);
        },
      });
      
      // FAIL LOUDLY if extraction fails
      if (!extractionResult.success) {
        const errorMessage = extractionResult.error || 'Failed to extract content from file';
        setUploadError(errorMessage);
        toast({
          title: 'Content extraction failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }
      
      // VERIFY we have actual content, not metadata
      if (!extractionResult.text || extractionResult.text.trim().length < 10) {
        const errorMessage = 'No readable content could be extracted from this file. Please try a different file.';
        setUploadError(errorMessage);
        toast({
          title: 'No content found',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }
      
      // Show warning if OCR confidence is low
      if (extractionResult.warning) {
        toast({
          title: 'Content extracted with warnings',
          description: extractionResult.warning,
          variant: 'default',
        });
      }
      
      setExtractionStatus('Processing content...');
      
      // Create raw content object with REAL extracted text
      const rawContent: RawExtractedContent = {
        sourceType: extractionResult.sourceType,
        rawText: extractionResult.text,
        fileName: file.name,
        fileSize: file.size,
        extractedAt: new Date(),
      };
      
      // Process through semantic normalization pipeline
      await processContent(rawContent);
      
      toast({
        title: 'Content processed successfully',
        description: `Extracted ${extractionResult.text.length} characters from ${file.name}`,
      });
      
      // Navigate to profiles to select accessibility needs
      setTimeout(() => navigate('/profiles'), 1500);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setUploadError(errorMessage);
      toast({
        title: 'Processing failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [processContent, toast, navigate, setUploadProgress, setUploadError]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);
  
  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setExtractionStatus('');
    resetContent();
  }, [resetContent]);
  
  const isProcessing = uploadState.status === 'uploading' || 
                       uploadState.status === 'extracting' || 
                       uploadState.status === 'normalizing';
  
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="mb-4">Upload Content</h1>
            <p className="text-muted-foreground readable-width mx-auto">
              Upload any educational content and we will transform it into 
              accessible formats tailored to your learning needs.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Select a File</CardTitle>
              <CardDescription>
                Supported formats: PDF, Images, Text files, Transcripts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleInputChange}
                  accept={acceptedFormats.map(f => f.accept).join(',')}
                  disabled={isProcessing}
                  aria-describedby="upload-description"
                />
                
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                    {isProcessing ? (
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                      <UploadIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div id="upload-description">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Maximum file size: 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress */}
              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <Progress value={uploadState.progress} />
                  <p className="text-sm text-center text-muted-foreground">
                    {extractionStatus || 'Processing...'}
                  </p>
                </div>
              )}
              
              {/* Status messages */}
              {uploadState.status === 'complete' && (
                <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/30">
                  <p className="text-sm text-center font-medium text-success">
                    Content processed successfully! Redirecting to profile selection...
                  </p>
                </div>
              )}
              
              {uploadState.status === 'error' && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-sm text-center text-destructive">
                    {uploadState.error}
                  </p>
                </div>
              )}
              
              {/* Clear button */}
              {selectedFile && !isProcessing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear and upload different file
                </Button>
              )}
              
              {/* Format icons */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Supported formats
                </p>
                <div className="flex justify-center gap-6">
                  {acceptedFormats.map((format) => (
                    <div 
                      key={format.type}
                      className="flex flex-col items-center gap-1 text-muted-foreground"
                    >
                      <format.icon className="h-6 w-6" />
                      <span className="text-xs">{format.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
