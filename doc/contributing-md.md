# Contributing to FoodVision

First off, thank you for considering contributing to FoodVision! It's people like you that make this project a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report and reproduce the issue.

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.
* **If the problem is related to performance or memory**, include a CPU profile capture with your report.
* **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps or point out the part where the enhancement should be implemented**.
* **Describe the current behavior and explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to.
* **Explain why this enhancement would be useful** to most FoodVision users.
* **List some other applications where this enhancement exists.**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible.
* Follow the JavaScript and Python styleguides.
* Include adequate tests.
* Document new code based on the Documentation Styleguide
* End all files with a newline

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 🚱 `:non-potable_water:` when plugging memory leaks
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies
    * 👕 `:shirt:` when removing linter warnings

### JavaScript Styleguide

All JavaScript code is linted with ESLint and formatted with Prettier.

* Prefer the object spread operator (`{...anotherObj}`) to `Object.assign()`
* Inline `export`s with expressions whenever possible
  ```js
  // Use this:
  export const foo = 'bar';
  
  // Instead of:
  const foo = 'bar';
  export { foo };
  ```
* Place imports in the following order:
    * External packages (e.g., 'react')
    * Internal modules (using relative paths)
* Place class properties in the following order:
    * Class methods and properties (methods starting with `static`)
    * Instance methods and properties
* Use arrow functions over anonymous function expressions.
* Use destructuring where it makes code clearer.

### Python Styleguide

* Follow PEP 8 style guide
* Use consistent docstring style (preferably Google style)
* Use f-strings for string formatting
* Use type hints where appropriate
* Keep functions and methods short and focused on a single responsibility
* Use meaningful variable names

### Documentation Styleguide

* Use Markdown for documentation.
* Reference methods and classes in markdown with the custom `{className}` and `{methodName}` syntax.
* Include code samples where appropriate.
* Document all public APIs.

## Getting Started

1. Create a fork of the repository
2. Clone your fork locally
3. Set up the development environment following the instructions in the README
4. Make your changes in a new git branch:
    ```
    git checkout -b my-fix-branch main
    ```
5. Create your patch, including appropriate test cases.
6. Run tests and ensure they pass.
7. Commit your changes using a descriptive commit message.
8. Push your branch to GitHub.
9. Submit a pull request through the GitHub website.

Thank you for contributing to FoodVision!
