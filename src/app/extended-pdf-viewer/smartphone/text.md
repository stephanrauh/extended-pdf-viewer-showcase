On a tiny smartphone, all the buttons are pushed to the secondary menu. That's most inconvenient, so chances are you want to put a small selection of buttons into the toolbar. The recommended way to do so is to define a <a href="extended-pdf-viewer/custom-toolbar">custom toolbar</a> or to use <a href="/extended-pdf-viewer/responsive-design">responsive design</a>.

However, you can also use CSS rules to do the trick. Don't forget to set <code>ignoreResponsiveCSS="true"</code>. Otherwise, your CSS rules will be overwritten by JavaScript. 

*Caveat*: the selector `/deep/` is deprecated and will be removed soon. As far as I know, the only replacement is putting the CSS rules into the global `styles.css` file. Also note that the `!important` bit is important. You can't avoid it because the CSS class `.hidden` already bears the `!important` tag.
