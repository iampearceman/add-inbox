# Add Inbox

A CLI command to easily add Novu's notification inbox component to your React or Next.js project.

## Installation & Usage

You can use this tool without installing it by running:

```bash
npx add-inbox@latest
```

This will guide you through an interactive process to add the Novu Inbox component to your project.

## Features

- ✅ Interactive CLI prompts for selecting framework and TypeScript options
- ✅ Support for React and Next.js
- ✅ Support for Tailwind CSS styling
- ✅ Automatic dependency installation
- ✅ Component creation in your project's component directory
- ✅ Environment variable setup for Novu configuration

## Demo

```
$ npx add-inbox@latest

🔔 Novu Inbox Component Installer

? What framework are you using? › 
❯ React
  Next.js

? Are you using TypeScript? › (Y/n)
```

## Example Usage in Your App

```jsx
import NovuInbox from '@/components/ui/inbox/novuInbox';

// Inside your component
return (
  <div>
    <header className="flex justify-between items-center">
      <h1>My App</h1>
      <Inbox />
    </header>
  </div>
);
```

## Configuration

Make sure to set up your Novu application ID:

For React:
```
NOVU_APP_ID=your_app_id_here
```

For Next.js:
```
NEXT_PUBLIC_NOVU_APP_ID=your_novu_app_id_here
```

## License

MIT
