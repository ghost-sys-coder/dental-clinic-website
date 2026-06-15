# RULES THAT CAN'T BE COMPROMISED

**Rule Set**:

- React component file names must be in the format ReactComponent.tsx not react-component.tsx
- We can't have multiple react components in the same file - one React component per file.
- Keep business logic out of the React component files where possible.
- Don't keep data constants in React components, fetch it from the /constants folder.
- Create SVGs in a separate file and then import them for use - don't create them in major React component files.
- Don't create custom components that the shadcn package already provides.
- Use custom CSS animations where necessary.
