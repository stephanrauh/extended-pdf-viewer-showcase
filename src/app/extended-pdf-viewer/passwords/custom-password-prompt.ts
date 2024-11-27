import { PasswordPrompt } from "ngx-extended-pdf-viewer";

export class CustomPasswordPrompt implements PasswordPrompt {

  private updateCallback!: (password: string) => void;

  public open(): void {
    if (confirm("Come on, GraalVM does not suck!")) {
      this.updateCallback("graalvm-rocks!");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setUpdateCallback(updateCallback: (password: string) => void, reason: 1 | 2) {
    this.updateCallback = updateCallback;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public close(): void {}
}
