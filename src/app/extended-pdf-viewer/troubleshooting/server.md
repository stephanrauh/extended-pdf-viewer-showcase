# Server Configuration Issues

## "Failed to load module script: Expected a JavaScript module script but the server responds with a MIME type of "text/plain"

Update your server configuration. Many servers don't recognize `*.mjs` files as JavaScript. To fix this, you have to configure the server so it sends the file with the proper MIME type (`text/javascript`). You also have to configure the new i18n files. They've got the file ending `.ftl` and need the MIME type `text/plain`.

For example, IIS requires this configuration:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>

  <system.webServer>
  <staticContent>
    <mimeMap fileExtension=".mjs" mimeType="text/javascript" />
    <mimeMap fileExtension=".ftl" mimeType="text/plain" />
  </staticContent>
  </system.webServer>

</configuration>
```

nginx requires this configuration:

```nginx
location / {
    ...

    location ~* \.mjs$ {
                # target only *.mjs files
                # now we can safely override types since we are only
                # targeting a single file extension.
                types {
                    text/javascript mjs;
                }
            }
  }
```

AWS amplify requires this configuration in the `amplify.yaml` file:

```yaml
customHeaders:
  - pattern: '*.mjs'
    headers:
      - key: 'Content-Type'
        value: 'application/javascript'
```

Azure Web App requires this configuration (notice the `application/javascript` setting):

```xml
<configuration>
    <system.webServer>
        <staticContent>
            <mimeMap fileExtension=".json" mimeType="application/json" />
            <mimeMap fileExtension=".importmap" mimeType="application/importmap+json" />
            <mimeMap fileExtension=".mjs" mimeType="application/javascript" />
            <mimeMap fileExtension=".ftl" mimeType="text/html" />
        </staticContent>
        <rewrite>
            <rules>
                <rule name="Main Rule" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```
