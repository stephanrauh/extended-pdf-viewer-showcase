On a tiny smartphone, all the buttons are pushed to the secondary menu. That's most inconvenient, so chances are you want to put a small selection of buttons into the toolbar. &lt;ngx-extended-pdf-viewer&gt; 1.1 is going to offer a dedicated API for that.

Until this version lands, you can use CSS rules to do the trick. Don't forget to set <code>ignoreResponsiveCSS="true"</code>. Otherwise, your CSS rules will be overwritten by JavaScript. 

*Caveat*: the selector `/deep/` is deprecated and will be remove soon. As far as I know, the only replacement is putting the CSS rules into the global `styles.css` file. Also note that the `!important` bit is important. You can't avoid it because the CSS class `.hidden` already bears the `!important` tag.
