// apps/platform/src/lib/debug/auth-debugger.js

import { axios } from 'axios';

class AuthDebugger {
  static instance;
  
  constructor() {
    this.isDebugEnabled = process.env.NODE_ENV === 'development';
    this.logPrefix = '[Auth Debug]';
  }

  static getInstance() {
    if (!AuthDebugger.instance) {
      AuthDebugger.instance = new AuthDebugger();
    }
    return AuthDebugger.instance;
  }

  logRequest(config) {
    if (!this.isDebugEnabled) return;

    console.group(`${this.logPrefix} Request`);
    console.log('URL:', config.url);
    console.log('Method:', config?.method?.toUpperCase());
    console.log('Headers:', this.sanitizeHeaders(config.headers));
    if (config.data) {
      console.log('Body:', this.sanitizeCredentials(config.data));
    }
    console.groupEnd();
  }

  logResponse(response) {
    if (!this.isDebugEnabled) return;

    console.group(`${this.logPrefix} Response`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', this.sanitizeHeaders(response.headers));
    if (response.data) {
      console.log('Body:', this.sanitizeAuthResponse(response.data));
    }
    console.groupEnd();
  }

  logError(error) {
    if (!this.isDebugEnabled) return;

    console.group(`${this.logPrefix} Error`);
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', error.response.data);
    }
    if (error.config) {
      console.error('Request URL:', error.config.url);
      console.error('Request Method:', error.config?.method?.toUpperCase());
    }
    console.error('Stack:', error.stack);
    console.groupEnd();
  }

  logTokenOperation(operation, accessToken, refreshToken) {
    if (!this.isDebugEnabled) return;

    console.group(`${this.logPrefix} Token ${operation}`);
    console.log('Access Token Present:', !!accessToken);
    console.log('Refresh Token Present:', !!refreshToken);
    if (accessToken) {
      const tokenData = this.decodeJwt(accessToken);
      console.log('Access Token Data:', tokenData);
      console.log('Token Expiry:', new Date(tokenData.exp * 1000).toISOString());
    }
    console.groupEnd();
  }

  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer [REDACTED]';
    }
    return sanitized;
  }

  sanitizeCredentials(data) {
    if (!data) return data;
    const sanitized = { ...data };
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    return sanitized;
  }

  sanitizeAuthResponse(data) {
    if (!data) return data;
    const sanitized = { ...data };
    if (sanitized.tokens) {
      sanitized.tokens = {
        accessToken: '[REDACTED]',
        refreshToken: '[REDACTED]',
        expiresIn: sanitized.tokens.expiresIn
      };
    }
    return sanitized;
  }

  decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return { error: 'Invalid token format' };
    }
  }
}

export const authDebugger = AuthDebugger.getInstance();