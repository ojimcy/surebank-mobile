/**
 * SureBank PIN Verification Service
 * 
 * Service for verifying PIN for sensitive operations like payments,
 * transfers, and settings changes.
 */


// PIN verification result
export interface PinVerificationResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

// PIN verification options
export interface PinVerificationOptions {
  title?: string;
  subtitle?: string;
  allowBiometric?: boolean;
  allowCancel?: boolean;
  reason?: string;
}

class PinVerificationService {
  private currentPromise: {
    resolve: (result: PinVerificationResult) => void;
    reject: (error: Error) => void;
  } | null = null;

  private modalVisible = false;
  private options: PinVerificationOptions = {};

  /**
   * Verify PIN for sensitive operations
   */
  async verifyPin(options: PinVerificationOptions = {}): Promise<PinVerificationResult> {
    return new Promise((resolve, reject) => {
      // If already showing PIN verification, reject
      if (this.currentPromise) {
        reject(new Error('PIN verification already in progress'));
        return;
      }

      this.currentPromise = { resolve, reject };
      this.options = {
        title: 'Verify PIN',
        subtitle: 'Please enter your PIN to continue',
        allowBiometric: true,
        allowCancel: true,
        ...options,
      };

      this.showPinModal();
    });
  }

  private showPinModal() {
    this.modalVisible = true;
    // This would trigger a re-render of the PinVerificationModal component
    this.notifyStateChange();
  }

  private hidePinModal() {
    this.modalVisible = false;
    this.currentPromise = null;
    this.options = {};
    // This would trigger a re-render of the PinVerificationModal component
    this.notifyStateChange();
  }

  private handlePinSuccess = () => {
    const promise = this.currentPromise;
    this.hidePinModal();
    
    if (promise) {
      promise.resolve({ success: true });
    }
  };

  private handlePinCancel = () => {
    const promise = this.currentPromise;
    this.hidePinModal();
    
    if (promise) {
      promise.resolve({ success: false, cancelled: true });
    }
  };

  private handlePinError = (error: string) => {
    const promise = this.currentPromise;
    this.hidePinModal();
    
    if (promise) {
      promise.resolve({ success: false, error });
    }
  };

  // State change notification (would be implemented with event emitter or state management)
  private stateChangeListeners: Set<() => void> = new Set();

  private notifyStateChange() {
    this.stateChangeListeners.forEach(listener => listener());
  }

  public onStateChange(listener: () => void) {
    this.stateChangeListeners.add(listener);
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  // Getters for modal state
  public get isVisible() {
    return this.modalVisible;
  }

  public get currentOptions() {
    return this.options;
  }

  public get handlers() {
    return {
      onSuccess: this.handlePinSuccess,
      onCancel: this.handlePinCancel,
      onError: this.handlePinError,
    };
  }
}

// Singleton instance
const pinVerificationService = new PinVerificationService();


export default pinVerificationService;