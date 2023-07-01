# Attributes, events, and attributes with two-way-binding

## Legend:

- [(attribute)] describes an attribute with two-way-binding
- [attribute] means that PDF-viewer reacts when the attribute changes
- (attribute) means an event is raised when the user changes a setting
- attribute (without special characters) means the attribute is used at load time only. Subsequent changes are ignored.

If you're missing an attribute, also have a look at the <a [routerLink]="'/extended-pdf-viewer/default-options'">default options</a>.

| _CSS rule_                                 |                                                   _description_                                                    |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| ngx-extended-pdf-viewer-prevent-touch-move | This CSS rule is added to the document body when one of the editors is active L(i.e. text editor or ink draw editor). It's used to prevent scrolling when drawing. If your page has a scrollbar, add a `touch-action: none` rule to the scrolling HTML element. |
