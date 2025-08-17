# Open AI Programmer

An AI-powered code generation platform built with RedwoodSDK and Cloudflare. This application provides a chat interface where users can describe what they want to build, and the AI generates complete React applications that run in real-time in a sandboxed environment.

## Features

- **AI Code Generation**: Uses OpenAI GPT-4 to generate complete React applications
- **Real-time Preview**: Generated code runs instantly in Cloudflare Sandbox
- **Split Interface**: Chat on the left, live preview on the right
- **React Server Components**: Server-side rendering with selective client hydration
- **Cloudflare Infrastructure**: Built on Workers, D1, and Container runtime

## Getting Started

```shell
git clone https://github.com/harshil1712/open-ai-programmer.git
cd open-ai-programmer
pnpm install
```

## Running the dev server

```shell
pnpm run dev
```

Point your browser to the URL displayed in the terminal (e.g. `http://localhost:5173/`). You'll see the AI programmer interface with a chat panel and preview area.

## Deploying your app

```shell
pnpm run release
```


## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
