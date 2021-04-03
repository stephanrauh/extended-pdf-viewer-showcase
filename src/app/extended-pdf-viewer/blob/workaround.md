```typescript
blobToBase64(blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }
```
