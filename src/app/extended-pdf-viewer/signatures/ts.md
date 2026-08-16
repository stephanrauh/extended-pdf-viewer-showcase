```typescript
import {
  pdfDefaultOptions,
  PdfSignatureToVerify,
  PdfSignatureVerificationResult,
  PdfSignatureVerifier,
} from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-signatures',
  templateUrl: './signatures.component.html',
})
export class SignatureComponent {
  // Without this input the signature properties panel never opens:
  // the browser build of pdf.js ships no verifier of its own.
  public myVerifier: PdfSignatureVerifier = {
    async verify(signature: PdfSignatureToVerify): Promise<PdfSignatureVerificationResult> {
      // signature.pkcs7 is the detached PKCS#7/CMS blob,
      // signature.data are the bytes it covers.
      // Checking the maths is the easy part - deciding which root
      // certificates you trust is the part only you can answer.
      return {
        status: 'untrusted', // 'verified' | 'invalid' | 'expired' | 'revoked' | 'unknown'
        errorCode: 'NO_TRUST_STORE',
        message: 'This application has no certificate store.',
        certificate: { subjectCN: 'Jane Doe', issuerCN: 'Example CA' },
      };
    },

    // Optional: called when the user clicks the certificate row.
    viewCertificate(certificate) {
      // open your own dialog here
    },
  };
}
```

The library never inspects the result - it forwards it to pdf.js. Reporting
`verified` is a claim your application makes, not one the library checks.
The panel therefore proves nothing to a user who does not already trust your
application: it renders JavaScript running in the page. Treat it as a
convenience for users who do trust you, not as a security control.
