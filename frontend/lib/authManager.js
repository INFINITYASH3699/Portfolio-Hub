// Singleton auth manager to prevent multiple simultaneous requests
class AuthManager {
  constructor() {
    this.pendingRequests = new Map();
    this.lastAuthCheck = 0;
    this.AUTH_CHECK_COOLDOWN = 5000; // 5 seconds
  }

  // Prevent duplicate requests by returning the same promise
  async makeRequest(key, requestFn) {
    // If we already have a pending request for this key, return it
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Reusing pending request for: ${key}`);
      return this.pendingRequests.get(key);
    }

    // Create new request
    const promise = requestFn()
      .finally(() => {
        // Remove from pending requests when done
        this.pendingRequests.delete(key);
      });

    // Store the promise
    this.pendingRequests.set(key, promise);
    
    return promise;
  }

  // Rate-limited auth check
  shouldCheckAuth(force = false) {
    if (force) return true;
    
    const now = Date.now();
    if (now - this.lastAuthCheck < this.AUTH_CHECK_COOLDOWN) {
      console.log(`⏳ Auth check skipped (cooldown: ${Math.ceil((this.AUTH_CHECK_COOLDOWN - (now - this.lastAuthCheck)) / 1000)}s)`);
      return false;
    }
    
    this.lastAuthCheck = now;
    return true;
  }

  // Clear all pending requests (useful for cleanup)
  clearPendingRequests() {
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const authManager = new AuthManager();