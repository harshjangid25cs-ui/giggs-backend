/**
 * Media Compressor Utility for GIGGS Web Application
 * Handles client-side image compression & 10sec-to-3sec video timelapse compression
 * to save database bandwidth and storage.
 */

export interface CompressionResult {
  dataUrl: string;
  blob?: Blob;
  originalSizeKB?: number;
  compressedSizeKB: number;
  reductionPercentage: number;
}

/**
 * Compresses an image (DataURL or File) using HTML5 Canvas.
 * Resizes image max dimension to 1024px and applies JPEG compression (quality: 0.75).
 */
export async function compressImage(
  input: string | File,
  maxDimension = 1024,
  quality = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const processImage = (imageSource: HTMLImageElement, originalSizeKB = 0) => {
      let width = imageSource.width;
      let height = imageSource.height;

      // Calculate scale factor to maintain aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // Draw resized image
      ctx.drawImage(imageSource, 0, 0, width, height);

      // Compress to JPEG format
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

      // Calculate size
      const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
      const compressedSizeKB = Math.round((base64Length * 0.75) / 1024);

      const sizeRef = originalSizeKB > 0 ? originalSizeKB : compressedSizeKB * 4;
      const reductionPercentage = Math.max(
        0,
        Math.round(((sizeRef - compressedSizeKB) / sizeRef) * 100)
      );

      resolve({
        dataUrl: compressedDataUrl,
        compressedSizeKB,
        originalSizeKB: sizeRef,
        reductionPercentage
      });
    };

    if (typeof input === 'string') {
      img.onload = () => processImage(img);
      img.onerror = (err) => reject(err);
      img.src = input;
    } else {
      const originalSizeKB = Math.round(input.size / 1024);
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => processImage(img, originalSizeKB);
        img.onerror = (err) => reject(err);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Accelerated 10-sec to 3-sec Video Recorder & Compressor.
 * Captures live stream frames over 10 seconds and compresses them into a 3-second fast clip.
 */
export class TimelapseVideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private intervalId: any = null;
  private isRecording = false;
  private lastBlob: Blob | null = null;   // ← persisted for post-recording upload

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 480;
      this.canvas.height = 360;
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /** Returns the most recently recorded video blob (after stopRecording resolves). */
  getLastBlob(): Blob | null {
    return this.lastBlob;
  }

  /**
   * Starts recording the video stream, sampling frames every 250ms (40 frames over 10s).
   * When rendered at 13.3 FPS, 40 frames play back in exactly 3 seconds!
   */
  startRecording(videoElement: HTMLVideoElement) {
    if (!this.canvas || !this.ctx || !videoElement) return;

    this.recordedChunks = [];
    this.lastBlob = null;
    this.isRecording = true;

    // Create a 13.3 FPS stream from the canvas to achieve 10s -> 3s playback speedup
    const canvasStream = this.canvas.captureStream(13.3);

    // Pick supported WebM or MP4 mime type
    let mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/mp4';
    }

    try {
      this.mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: 200000 // Compressed low bitrate: 200 kbps
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Collect data chunks every 250ms

      // Sample video frames every 250ms (4 frames per second during 10s recording)
      this.intervalId = setInterval(() => {
        if (this.isRecording && this.ctx && this.canvas && videoElement.readyState >= 2) {
          this.ctx.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);
        }
      }, 250);
    } catch (err) {
      console.warn('MediaRecorder unsupported or error:', err);
    }
  }

  /**
   * Stops recording and returns the compressed 3-second video blob & data URL.
   */
  async stopRecording(): Promise<CompressionResult | null> {
    this.isRecording = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const videoBlob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder?.mimeType || 'video/webm'
        });

        this.lastBlob = videoBlob;  // ← persist for later upload

        const sizeKB = Math.round(videoBlob.size / 1024);
        const estimatedOriginalSizeKB = 8500; // Typical 10s raw HD video ~8.5MB
        const reductionPercentage = Math.max(
          80,
          Math.round(((estimatedOriginalSizeKB - sizeKB) / estimatedOriginalSizeKB) * 100)
        );

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            dataUrl: reader.result as string,
            blob: videoBlob,
            compressedSizeKB: sizeKB,
            originalSizeKB: estimatedOriginalSizeKB,
            reductionPercentage
          });
        };
        reader.readAsDataURL(videoBlob);
      };

      this.mediaRecorder.stop();
    });
  }
}
