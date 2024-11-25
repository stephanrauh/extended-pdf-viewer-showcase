```typescript
 @Component({
standalone: false,  ... })
export class SimpleComponent {
  public set theme(theme: 'dark' || 'light') {
    // this demo stores the theme in the local storage 
    // because it take on reload only
    localStorage.setItem('ngx-extended-pdf-viewer.theme', theme);
    location = location; // force reload
  }

  public get theme(): 'dark' || 'light' {
    return localStorage.getItem('ngx-extended-pdf-viewer.theme') || 'light';
  }
}
```
