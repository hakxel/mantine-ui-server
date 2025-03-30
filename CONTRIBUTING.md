# Contributing to Mantine UI MCP Server

Thank you for considering contributing to this project! Here's how you can help.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/mantine-ui-server.git`
3. Install dependencies: `npm install`
4. Make your changes
5. Build and test: `npm run build`

## Development Workflow

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly
4. Commit with a clear message describing your changes
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request with a detailed description of your changes

## Adding New Features

### Adding a New Tool

To add a new tool to the server:

1. Add the tool definition to the `ListToolsRequestSchema` handler in `src/index.ts`
2. Implement the tool functionality in an appropriate module
3. Add the tool handler to the `CallToolRequestSchema` handler in `src/index.ts`
4. Document the tool in README.md

### Modifying Existing Tools

When modifying existing tools:

1. Maintain backwards compatibility when possible
2. Update all relevant documentation
3. Consider adding a version parameter if the change is significant

## Testing

Test your changes thoroughly to ensure they don't break existing functionality.

## Documentation

Update the documentation when adding or changing features:

1. Update README.md
2. Add JSDoc comments to your code
3. Include examples of how to use new features

## Pull Request Guidelines

1. Make sure your code builds without errors
2. Follow existing code style
3. Include tests for new functionality
4. Update documentation as needed
5. Keep PRs focused - one feature or bug fix per PR

Thank you for contributing!
