# Contributing to CagD-Log

First off, thank you for considering contributing to cagd-log! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, configuration)
- **Describe the behavior you observed** and what you expected
- **Include Node.js version** and operating system
- **Include relevant log output or error messages**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most users
- **Provide code examples** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes**:
   - Add tests if applicable
   - Update documentation (README.md, JSDoc comments)
   - Follow the existing code style
3. **Test your changes**:
   ```bash
   node example-scoped.js
   node example-custom-levels.js
   ```
4. **Commit your changes**:
   - Use clear and meaningful commit messages
   - Reference issues if applicable (`fixes #123`)
5. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/cagd-log.git
cd cagd-log

# No build step needed - it's pure JavaScript!
# Test your changes
node example-scoped.js
```

## Code Style Guidelines

### JavaScript

- Use meaningful variable names
- Add JSDoc comments for public methods
- Keep functions small and focused
- Use const/let, avoid var
- Follow existing indentation (4 spaces)

### Documentation

- Update README.md for new features
- Add JSDoc comments with @param, @returns, @example
- Include code examples for new APIs
- Update CHANGELOG.md

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests after the first line

Examples:
```
Add scoped logger support

- Implement _createScopedLogger method
- Add dual-mode to log() function
- Update documentation with examples
Fixes #42
```

## Project Structure

```
cagd-log/
├── index.js              # Main logger implementation
├── index.d.ts            # TypeScript definitions
├── default_config.js     # Default configuration
├── package.json          # Package metadata
├── README.md             # Main documentation
├── CHANGELOG.md          # Version history
├── CONTRIBUTING.md       # This file
├── SCOPED-LOGGER-GUIDE.md # Detailed scoped logger guide
├── example-*.js          # Usage examples
└── LICENSE               # MIT License
```

## Adding a New Feature

1. **Discuss first** - Open an issue to discuss the feature
2. **Plan the API** - Design a clean, intuitive API
3. **Implement** - Write the code with proper error handling
4. **Document** - Add JSDoc, README examples, TypeScript types
5. **Test** - Create an example file demonstrating the feature
6. **Update CHANGELOG.md** - Document your changes

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Questions?

Feel free to open an issue with your question or reach out to the maintainer.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
