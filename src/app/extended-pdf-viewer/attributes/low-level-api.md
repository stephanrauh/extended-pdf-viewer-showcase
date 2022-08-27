# Attributes, events, and attributes with two-way-binding

## Legend:

- [(attribute)] describes an attribute with two-way-binding
- [attribute] means that PDF-viewer reacts when the attribute changes
- (attribute) means an event is raised when the user changes a setting
- attribute (without special characters) means the attribute is used at load time only. Subsequent changes are ignored.

If you're missing an attribute, also have a look at the <a [routerLink]="'/extended-pdf-viewer/default-options'">default options</a>.

| _Attribute_     |    _description_     | _source code_                                                                                                                                                                                                                                                |
| :-------------- | :------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fileInputChange | file-input-change.md | Notifies you when the source changes, similar to `(src)`, but it allows you to access more information about the change. In particular, you're dragging a file into the PDF viewer, you'll find the `clientX` and `clientY` coordinates in the change event. |
