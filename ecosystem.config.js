export const apps = [{
  name: "api",
  script: "src/server-wrapper.js",  // Point to wrapper, not your TS file
  interpreter: "bun",
  interpreter_args: "--bun",
  max_memory_restart: "1024M",
  env: {
    NODE_ENV: "production",
    PORT: 3002,
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`
  }
}]
