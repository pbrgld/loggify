# @pbrgld/Loggify

> ⚠️ **Project Status: Early Development** ⚠️
>
> 🚧 **Warning:** Loggify is currently in an **early development stage**.  
> The version on the `main` branch is considered **unstable** and may change significantly.
>
> 🧪 Expect breaking changes as features are added and the API evolves.
>
> 🙌 Your feedback, bug reports, and contributions are highly appreciated!  
> Help shape Loggify into a reliable and performant logging tool.
>
> ---

Loggify is a fast, zero-dependency logging library built for modern JavaScript and TypeScript runtimes – especially fun with Bun.js!

Designed for developers who want more expressive and structured logs without sacrificing performance, loggify brings a fresh logging experience using styled output, emoji-enhanced messages, and flushable contextual logs that keep related information together.

## 🚀 Features

- ⚡ **Zero dependencies** – lightweight and fast by design
- 🧵 **Context-aware logging** – group related logs and flush them together
- 🖨️ **Uses stdout instead of console.log** – for faster, cleaner output
- 🎨 **Styled text output** – control colors, formatting, and visibility
- 🕵️ **Caller info support** – trace logs back to where they were triggered
- 🕒 **Customizable timestamps** – add or remove as needed
- 😎 **Emoji-based or text-based tags** – switch as you like
- 🔧 **Built to play nicely with Bun.js** – but works with Node.js too!

## ⚙️ Installation

You can install **Loggify** using either `bun` or `npm`:

### Using bun

```bash
bun add @pbrgld/loggify
```

### Using `npm` for node.js

```bash
npm install @pbrgld/loggify
```

## 🧩 Use in Your Code

**Loggify** works seamlessly with both **TypeScript** and **JavaScript** projects.

### TypeScript Example

```ts
import Loggify from "@pbrgld/loggify";

const loggify: Loggify = new Loggify();

loggify.console("Hello world");
```

### Simple console log

In the most simplest way, use the console method and provide a string as message to be sent to the console. As second parameter you can define a log type e.g. "okay", "success", "warn", "error" or the identifier for an emoji:

```ts
loggify.console("Hello world", "rocket");
```

![Output: simple console log](documentation/caseSimpleLog.png)

> 🧠 **Note:** Constructor Defaults & Auto-Configuration
>
> If the constructor is called without any arguments, a comprehensive default initialization is applied.
> This ensures that Loggify is fully functional out of the box, using sensible defaults for context management, output styling, and performance-optimized logging behavior.
> The defaults settings are:
>
> - Show log type as emoji
> - Log timestamp as time only
> - Show app's current memory consumption: Heap used, Heap total and total memory allocation in memors (rss)
> - Caller information (shows file as well as line and eventually function from where this log informtaion has been triggered from)
> - Followed by the message provided

### Constructor Parameters

You can configure Loggify by passing an options object to the constructor.
This allows you to customize the logger’s behavior to fit your project’s structure, output preferences, and runtime environment.

The available parameters are well-typed and fully documented through TypeScript definitions – so you can rely on auto-completion and inline hints in modern editors to explore all configuration options.

Simply pass the options you need – and omit the rest. Loggify applies sensible defaults for any parameters you leave out.

```ts
const loggify: Loggify = new Loggify({
  logCallerInformation: false,
  logMemoryUsage: false,
  logTimestamp: {
    enabled: true,
    mode: "dateTime",
  },
});
```

![Output: removed caller information and memory usage via constructor](documentation/constructorNoMeMCaller.png)

> 👆 **Hint:** This is an example, how to set the parameters in the constructor to remove caller information and memory usage and log the timestamp in date-time mode.

### Text coloring and styling and using emojis

**Loggify** supports inline styling and emoji enhancements directly within your message strings, using a simple and expressive tag syntax inspired by HTML.

To apply styling or emojis, use square brackets followed by a type (ansi or emoji) and a colon-separated value.

#### Syntax

- [ansi:<style|color>] — Apply text styles or colors

  e.g., red, yellow, green, italic, underline, inverse

- [emoji:<name>] — Inject emoji symbols by keyword

  e.g., check, rocket, warning, bug

- [ansi:reset] — Resets the style to default (required to stop inherited formatting)

#### Example

```ts
loggify.console(
  "Hello [ansi:underline]world[ansi:reset]! This will be [ansi:red]red[ansi:reset] and [ansi:blue][ansi:inverse]blue[ansi:reset] text and showing an emoji [emoji:success]  ",
  "rocket"
);
```

![Output: Color, style and emoji logging](documentation/caseColorStyleEmoji.png)

This feature gives you powerful control over the visual appearance of your logs — without needing external dependencies or manual ANSI codes.

### Object Logging Made Clear and Informative

**Loggify** supports clean and structured logging of complex objects right out of the box.
Just pass any object to the logger, and **Loggify** will take care of the rest:

- ✅ Outputs in a readable and color-coded format, with type-specific highlighting
- 🧠 Automatically determines the buffer size and character length of the object
- 🧩 Supports deeply nested structures and mixed data types
- 🎯 Designed to preserve clarity, even in large or dynamic logs

This makes it easier to inspect the state of your application without losing track of key information – especially in asynchronous or data-heavy environments.

```ts
loggify.console("Hello world", "rocket", {}, object);
```

![Output: object logging](documentation/caseObject.png)

### Log example for time measuring

**Loggify** supports built-in performance metrics logging by passing a metrics object through the logger options.

You can provide:

- A start and end timestamp (e.g. from performance.now())
- Or a direct duration in milliseconds
- (Optionally) set the log type to 'metrics' to emphasize performance-related output

When metrics are provided, **Loggify** will automatically calculate and append the duration to the log message.
Even better: durations are automatically converted into human-readable formats like seconds, minutes, or hours — depending on the threshold — so they’re much easier to interpret at a glance.

```ts
// Start performance timer
const performanceTimerStart: number = performance.now();
// < Your code goes here
// End performance timer
const performanceTimerEnd: number = performance.now();
loggify.console("Hello world", "metrics", {
  metrics: {
    start: performanceTimerStart,
    end: performanceTimerEnd,
  },
});
```

This makes it simple to track the performance of asynchronous operations and benchmark critical sections of your application — without manual formatting or external tools.

![Output: metrics](documentation/caseMetrics.png)

> 🧠 **Advanced notice:** You can either pass the performance counter _start_ and end _metrics_ via the metrics object or alternatively you can pass milliseconds to the _duration_ parameter if you only have a result value.

### Context logging example

**Loggify** supports context-based logging, a powerful mechanism that lets you group related log messages under a shared execution context — and output them all at once, in a clean, structured block.

This is especially helpful for asynchronous workflows or parallel processes, where traditional logging often becomes fragmented and hard to follow.

#### 🔧 How It Works

1. Generate a unique contextId using the built-in **Loggify.generateContextId()** method.
2. Pass this contextId to each log call associated with the same logical process.
3. Instead of immediately printing, Loggify will collect all related logs in-memory using a performant internal HashMap.
4. Once the operation completes, call **Loggify.flush(contextId)** to output the entire log block to the console.

#### 🚀 Key Benefits

- 🧠 Consolidated Logs: All logs related to a context are grouped and printed together — no more scattered entries across hundreds of lines.
- 🕒 Optional Duration Tracking: Loggify measures and includes the total execution time for each context block.
- ⚡ High Performance: Logging operations are non-blocking and memory-efficient.
- ♾️ Fully Concurrent: You can manage an unlimited number of parallel logging contexts without interference.

📌 Example

```ts
// Define a unique contextID
const uniqueContextId: string = loggify.generateContextId();

// Initialize the context by passing contextID and optionally title as well as performance start
loggify.console("Demo function start", "init", {
  context: {
    id: uniqueContextId,
    title: "Demo function for documentation",
    start: performance.now(),
  },
});

// Append context based logging by adding the contextID in each log statement
loggify.console("Some logging inside the demo function", undefined, {
  context: { id: uniqueContextId },
});

// Finish by either error or success, adding contextID of course as well as performance end timer if you wish
loggify.console("Demo function end", "finished", {
  context: { id: uniqueContextId, end: performance.now() },
});

// Finally use the flush method and provide the contextID to send everything to console
loggify.flush(uniqueContextId);
```

![Output: context based logging](documentation/caseContext.png)

## 🧭 Project Philosophy & Community Focus

This is the **first package** I’m sharing with the community – and it’s something I deeply care about.
With **Loggify**, my goal is to create a logging tool that helps developers stay focused, informed, and productive – especially when working on complex projects with asynchronous processes and nested dependencies.

Logging is not just a technical feature – it’s a **developer’s compass** in growing codebases.
When things get messy, good logs can mean the difference between clarity and chaos.

That’s why **Loggify** focuses on:

- ✅ **Simplicity** – clear API, no unnecessary complexity
- 🚀 **Performance** – using stdout, no dependencies
- 💡 **Developer Experience** – styled, structured, and readable logs
- 🔁 **General-purpose use cases** – helpful in any project context
- 🤝 **Community-driven development** – your input matters!

If **Loggify** helps you solve a problem, I’d love to hear about it – and I’m happy to support others in turning their ideas into reality. Let’s build something useful together.

### 🗺️ Roadmap – What’s Next for Loggify

Loggify is just getting started, and there are exciting features on the horizon!  
The following improvements are planned to make Loggify even more powerful and flexible for all kinds of environments and use cases.

#### ✅ Planned Features

1. **🌐 Browser Support**  
   Currently, Loggify is optimized for **Node.js** and **Bun.js** environments.  
   Future versions will bring compatibility with modern browsers and frontend workflows.

2. **🎨 Custom Style Templates (Tag-Based)**  
   Instead of manually setting styles like `color` or `bold`, you’ll be able to use **semantic tags** like `[style:file]`, `[style:warning]`, etc.  
   These tags will map to custom-defined style presets – making your logging both cleaner and more expressive.

## 📝 License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.  
© 2025 Paul Bergold
